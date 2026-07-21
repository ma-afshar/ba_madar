import { Elysia, t } from "elysia";
import { getSessionUser, logout, requestOtp, verifyOtp } from "../services/auth.service";
import { prisma } from "../db/prisma";

function bearerToken(header?: string) {
  return header?.startsWith("Bearer ") ? header.slice(7) : "";
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/request-otp", async ({ body, set }) => {
    try { return await requestOtp(body.phone); }
    catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
      set.status = code === "OTP_RATE_LIMIT" ? 429 : code === "INVALID_PHONE" ? 400 : 503;
      return { error: code };
    }
  }, { body: t.Object({ phone: t.String() }) })
  .post("/verify-otp", async ({ body, set }) => {
    try { return await verifyOtp(body.phone, body.code); }
    catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
      set.status = code === "INVALID_OTP" || code === "OTP_EXPIRED" ? 400 : 500;
      return { error: code };
    }
  }, { body: t.Object({ phone: t.String(), code: t.String() }) })
  .get("/me", async ({ headers, set }) => {
    const user = await getSessionUser(bearerToken(headers.authorization));
    if (!user) { set.status = 401; return { error: "UNAUTHORIZED" }; }
    return { user };
  })
  .patch("/me", async ({ headers, body, set }) => {
    const user = await getSessionUser(bearerToken(headers.authorization));
    if (!user) { set.status = 401; return { error: "UNAUTHORIZED" }; }
    const updated = await prisma.user.update({ where: { id: user.id }, data: { firstName: body.firstName.trim() || null, lastName: body.lastName.trim() || null }, select: { id: true, phone: true, firstName: true, lastName: true } });
    return { user: updated };
  }, { body: t.Object({ firstName: t.String({ maxLength: 60 }), lastName: t.String({ maxLength: 60 }) }) })
  .post("/logout", async ({ headers }) => {
    const token = bearerToken(headers.authorization);
    if (token) await logout(token);
    return { success: true };
  });
