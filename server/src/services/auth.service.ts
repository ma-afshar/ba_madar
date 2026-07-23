import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "../db/prisma";

const OTP_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OTP_SECRET = process.env.OTP_SECRET ?? "change-this-secret-in-production";

export function normalizePhone(value: string) {
  const normalized = value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "");
  return normalized.startsWith("98") ? `0${normalized.slice(2)}` : normalized;
}

export function isValidPhone(phone: string) {
  return /^09\d{9}$/.test(phone);
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashOtp(phone: string, code: string) {
  return hash(`${phone}:${code}:${OTP_SECRET}`);
}

async function sendOtp(phone: string, code: string) {
  const url = process.env.SMS_API_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") throw new Error("SMS_NOT_CONFIGURED");
    console.log(`[auth] development OTP for ${phone}: ${code}`);
    return;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SMS_API_KEY ? { Authorization: `Bearer ${process.env.SMS_API_KEY}` } : {}),
    },
    body: JSON.stringify({ to: phone, code, message: `کد ورود مادر مارکت: ${code}` }),
  });
  if (!response.ok) throw new Error("SMS_SEND_FAILED");
}

export async function requestOtp(rawPhone: string, restart = false) {
  const phone = normalizePhone(rawPhone);
  if (!isValidPhone(phone)) throw new Error("INVALID_PHONE");

  const latest = await prisma.otpChallenge.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (!restart && latest && Date.now() - latest.createdAt.getTime() < 60_000) throw new Error("OTP_RATE_LIMIT");

  const code = String(randomInt(1000, 10000));
  await prisma.otpChallenge.create({
    data: { phone, codeHash: hashOtp(phone, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  await sendOtp(phone, code);
  return { phone, expiresIn: OTP_TTL_MS / 1000, ...(process.env.NODE_ENV !== "production" ? { debugCode: code } : {}) };
}

export async function verifyOtp(rawPhone: string, code: string) {
  const phone = normalizePhone(rawPhone);
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: 5 } },
    orderBy: { createdAt: "desc" },
  });
  if (!challenge) throw new Error("OTP_EXPIRED");

  const expected = Buffer.from(challenge.codeHash, "hex");
  const received = Buffer.from(hashOtp(phone, normalizePhone(code)), "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    throw new Error("INVALID_OTP");
  }

  const user = await prisma.$transaction(async (tx) => {
    await tx.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
    return tx.user.upsert({ where: { phone }, update: {}, create: { phone } });
  });
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({ data: { userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + SESSION_TTL_MS) } });
  return { token, user: { id: user.id, phone: user.phone, firstName: user.firstName, lastName: user.lastName } };
}

export async function getSessionUser(token: string) {
  const session = await prisma.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  return { id: session.user.id, phone: session.user.phone, firstName: session.user.firstName, lastName: session.user.lastName };
}

export async function logout(token: string) {
  const session = await prisma.session.findUnique({ where: { tokenHash: hash(token) }, select: { userId: true } });
  if (session) await prisma.session.deleteMany({ where: { userId: session.userId } });
}
