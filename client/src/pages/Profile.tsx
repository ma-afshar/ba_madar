import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/layout/BottomNavigation";
import { getCurrentUser, logout, updateProfile, type AuthUser } from "../lib/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { getCurrentUser().then(current => { if (!current) navigate("/login", { replace: true }); else { setUser(current); setFirstName(current.firstName ?? ""); setLastName(current.lastName ?? ""); } }).finally(() => setLoading(false)); }, [navigate]);
  const save = async (event: FormEvent) => { event.preventDefault(); setSaving(true); setMessage(""); try { const updated = await updateProfile(firstName, lastName); setUser(updated); setMessage("اطلاعات پروفایل با موفقیت ذخیره شد."); } catch { setMessage("ذخیره اطلاعات انجام نشد؛ دوباره تلاش کنید."); } finally { setSaving(false); } };
  const signOut = async () => { setLoggingOut(true); try { await logout(); navigate("/home", { replace: true }); } finally { setLoggingOut(false); } };

  if (loading || !user) return <main className="profile-page"><div className="profile-loading"><i />در حال دریافت اطلاعات...</div></main>;
  return <><main className="profile-page" dir="rtl">
    <header className="profile-header"><button type="button" onClick={() => navigate("/home")} aria-label="بازگشت">‹</button><h1>پروفایل من</h1><img src="/images/header/logo.png" alt="مادر مارکت" /></header>
    <section className="profile-hero"><div className="profile-avatar"><img src="/images/navigationbar/user.png" alt="" aria-hidden="true" /><i /></div><div><h2>{firstName || lastName ? `${firstName} ${lastName}`.trim() : "کاربر مادر مارکت"}</h2><p dir="ltr">{user.phone}</p><span>حساب فعال</span></div></section>
    <form className="profile-form" onSubmit={save}><div className="profile-form-title"><h2>اطلاعات شخصی</h2><p>نام و نام خانوادگی خود را تکمیل یا ویرایش کنید.</p></div>
      <div className="profile-name-row"><label><span>نام</span><input value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={60} placeholder="نام خود را وارد کنید" /></label><label><span>نام خانوادگی</span><input value={lastName} onChange={event => setLastName(event.target.value)} maxLength={60} placeholder="نام خانوادگی" /></label></div>
      <label><span>شماره موبایل</span><div className="profile-phone"><input dir="ltr" value={user.phone} readOnly /><span>تأیید شده ✓</span></div><small>شماره موبایل حساب قابل تغییر نیست.</small></label>
      {message && <p className={message.includes("موفقیت") ? "profile-message success" : "profile-message"}>{message}</p>}
      <button className="profile-save" disabled={saving}>{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
    </form>
    <button type="button" className="profile-logout" onClick={() => setShowLogout(true)}><span>خروج از حساب کاربری</span><b>←</b></button>
  </main><BottomNavigation />{showLogout && <div className="logout-dialog-backdrop" role="presentation" onClick={() => !loggingOut && setShowLogout(false)}><section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title" onClick={event => event.stopPropagation()}><div className="logout-dialog-icon">↪</div><h2 id="logout-title">خروج از حساب کاربری</h2><p>آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟</p><div><button type="button" onClick={() => setShowLogout(false)} disabled={loggingOut}>انصراف</button><button type="button" className="confirm" onClick={signOut} disabled={loggingOut}>{loggingOut ? "در حال خروج..." : "خروج از حساب"}</button></div></section></div>}</>;
}
