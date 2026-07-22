import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../lib/auth";

const navigationItems = [
  { label: "خانه", icon: "/images/navigationbar/vector.png", href: "/home" },
  { label: "سبد خرید", icon: "/images/navigationbar/shoppingbasket.png", href: "/basket" },
  { label: "سفارش‌ها", icon: "/images/navigationbar/receipt.png", href: "/orders" },
  { label: "ورود", icon: "/images/navigationbar/user.png", href: "/login" },
];

export default function BottomNavigation() {
  const { pathname } = useLocation();
  const [currentUser, setCurrentUser] = useState<{ id: number; phone: string } | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUser().then(user => { if (active) setCurrentUser(user); });
    return () => { active = false; };
  }, [pathname]);

  return (
    <nav aria-label="منوی اصلی" className="fixed bottom-0 left-1/2 z-50 h-18 w-full max-w-93.75 -translate-x-1/2 border-t border-[#EEEEEE] bg-white" dir="rtl">
      <div className="mx-auto grid h-full w-83 grid-cols-4">
        {navigationItems.map((item) => {
          const href = item.href === "/login" && currentUser ? "/profile" : item.href;
          const active = pathname === href;
          const content = (
            <>
              {active && <span className="absolute -top-px left-1/2 h-1 w-9 -translate-x-1/2 rounded-b-full bg-[#FF572D]" />}
              <span className="bottom-nav-icon-wrap"><img src={item.icon} alt="" aria-hidden="true" className={`h-5 w-5 object-contain ${active ? "bottom-nav-active-icon" : "grayscale opacity-60"}`} />{item.href === "/login" && currentUser && <i className="bottom-nav-online" aria-label="کاربر آنلاین" />}</span>
              <span className={`bottom-nav-label ${item.href === "/login" ? "bottom-nav-account-label" : ""}`}>{item.href === "/login" && currentUser ? "پروفایل" : item.label}</span>
            </>
          );

          return href.startsWith("/") ? (
            <Link key={item.label} to={href} aria-current={active ? "page" : undefined} className={`relative flex flex-col items-center pt-3 no-underline ${active ? "text-[#FF572D]" : "text-[#B8B8B8]"}`}>
              {content}
            </Link>
          ) : (
            <a key={item.label} href={href} className="relative flex flex-col items-center pt-3 text-[#B8B8B8] no-underline">{content}</a>
          );
        })}
      </div>
    </nav>
  );
}
