import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestOtp, saveAuthToken, verifyOtp } from "../lib/auth";

type VerifyLocationState = {
  phoneNumber?: string;
};

export default function VerifyPhone() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const phoneNumber = (state as VerifyLocationState | null)?.phoneNumber ?? sessionStorage.getItem("pending_login_phone") ?? "";
  const [code, setCode] = useState(["", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isCodeComplete = code.every(Boolean);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const toPersianDigits = (value: string) =>
    value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

  const formattedTimer = toPersianDigits(
    `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`,
  );

  const handleCodeChange = (index: number, value: string) => {
    if (errorMessage) setErrorMessage("");
    const digit = value.replace(/[^0-9۰-۹٠-٩]/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = digit;
    setCode(nextCode);
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (digit && index === 3) {
      inputRefs.current[index]?.blur();
    }
  };

  const handleCodeKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const normalizeDigits = (value: string) => value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

  const handleVerify = async () => {
    if (!isCodeComplete || isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const result = await verifyOtp(phoneNumber, normalizeDigits(code.join("")));
      saveAuthToken(result.token);
      sessionStorage.removeItem("pending_login_phone");
      navigate("/home", { replace: true });
    } catch (error) {
      setCode(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      const errorCode = error instanceof Error ? error.message : "REQUEST_FAILED";
      setErrorMessage(
        errorCode === "OTP_EXPIRED"
          ? "زمان اعتبار کد به پایان رسیده است؛ لطفاً کد جدید دریافت کنید."
          : errorCode === "INVALID_OTP"
            ? "کد واردشده صحیح نیست؛ لطفاً دوباره بررسی کنید."
            : "تأیید کد انجام نشد؛ لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage("");
    try {
      const result = await requestOtp(phoneNumber);
      if (result.debugCode) console.info(`Development OTP: ${result.debugCode}`);
      setCode(["", "", "", ""]);
      setSecondsLeft(120);
      inputRefs.current[0]?.focus();
    } catch {
      setErrorMessage("ارسال مجدد کد انجام نشد؛ لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <main className="login-page verify-page" dir="rtl">
      <header className="login-header">
        <button type="button" aria-label="بازگشت" onClick={() => navigate(-1)} className="login-back">
          <span aria-hidden="true">‹</span>
        </button>
      </header>

      <section className="login-content verify-content">
        <div className="login-brand" aria-label="مادر مارکت، فروشگاه سوپرمارکتی">
          <img src="/images/login/Login-logo.png" alt="مادر مارکت، فروشگاه سوپرمارکتی" />
        </div>

        <div className="verify-form">
          <h1>ورود</h1>
          <p className="verify-prompt">
            کد ارسال شده به شماره موبایل <bdi>{phoneNumber}</bdi> را وارد کن
          </p>

          <div className={errorMessage ? "verify-code has-error" : "verify-code"} dir="ltr" aria-label="کد تایید">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputRefs.current[index] = element; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleCodeChange(index, event.target.value)}
                onKeyDown={(event) => handleCodeKeyDown(index, event.key)}
                onFocus={(event) => event.currentTarget.select()}
                aria-invalid={Boolean(errorMessage)}
                aria-label={`رقم ${index + 1} کد تایید`}
              />
            ))}
          </div>

          {errorMessage && <p className="verify-error" role="alert">{errorMessage}</p>}

          <button type="button" className="login-continue verify-submit" disabled={!isCodeComplete || isSubmitting} onClick={handleVerify}>تایید</button>

          <div className="verify-actions">
            <button type="button" className="verify-resend" disabled={secondsLeft > 0} onClick={handleResend}>
              <span className="verify-clock" aria-hidden="true" />
              دریافت مجدد کد
            </button>
            <span className="verify-timer" dir="ltr">{formattedTimer}</span>
            <button type="button" className="verify-edit" onClick={() => navigate(-1)}>
              <img className="verify-edit-icon" src="/images/login/edit.png" alt="" aria-hidden="true" />
              ویرایش شماره
            </button>
          </div>
        </div>
      </section>

      <div className="verify-illustration" aria-hidden="true">
        <img src="/images/login/verification.png" alt="" />
      </div>
    </main>
  );
}
