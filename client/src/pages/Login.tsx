import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const isComplete = phoneNumber.length === 11;

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/[^0-9۰-۹٠-٩]/g, "").slice(0, 11);
    setPhoneNumber(digitsOnly);
  };

  return (
    <main className="login-page" dir="rtl">
      <header className="login-header">
        <button type="button" aria-label="بازگشت" onClick={() => navigate(-1)} className="login-back"><span aria-hidden="true">‹</span></button>
      </header>
      <section className="login-content">
        <div className="login-brand" aria-label="مادر مارکت، فروشگاه سوپرمارکتی">
          <img src="/images/login/Login-logo.png" alt="مادر مارکت، فروشگاه سوپرمارکتی" />
        </div>
        <div className="login-form">
          <h1>ورود</h1>
          <p className="login-prompt">شماره موبایل خود را وارد کنید</p>
          <div className="login-phone-field">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              value={phoneNumber}
              onChange={(event) => handlePhoneChange(event.target.value)}
              aria-label="شماره موبایل"
            />
            <span className="login-phone-icon" aria-hidden="true">
              <img src="/images/login/mobile.png" alt="" />
            </span>
          </div>
          <button
            type="button"
            className="login-continue"
            disabled={!isComplete}
            onClick={() => navigate("/login/verify", { state: { phoneNumber } })}
          >
            ادامه
          </button>
          <p className="login-terms">ورود شما به معنای پذیرش <a href="#terms">شرایط خدمات و حریم خصوصی</a> است.</p>
        </div>
      </section>
      <div className="login-illustration" aria-hidden="true"><img src="/images/login/login.png" alt="" /></div>
    </main>
  );
}
