import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type VerifyLocationState = {
  phoneNumber?: string;
};

export default function VerifyPhone() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const phoneNumber = (state as VerifyLocationState | null)?.phoneNumber ?? "۰۹۰۲۸۷۶۵۴۳۲";
  const [code, setCode] = useState(["", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(120);
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

          <div className="verify-code" dir="ltr" aria-label="کد تایید">
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
                aria-label={`رقم ${index + 1} کد تایید`}
              />
            ))}
          </div>

          <button type="button" className="login-continue verify-submit" disabled={!isCodeComplete}>تایید</button>

          <div className="verify-actions">
            <button type="button" className="verify-resend" disabled={secondsLeft > 0} onClick={() => setSecondsLeft(120)}>
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
