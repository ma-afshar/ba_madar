const navigationItems = [
  {
    label: "خانه",
    icon: "/images/navigationbar/vector.png",
    href: "#home",
    active: true,
  },
  {
    label: "سبد خرید",
    icon: "/images/navigationbar/shoppingbasket.png",
    href: "#cart",
  },
  {
    label: "سفارش‌ها",
    icon: "/images/navigationbar/receipt.png",
    href: "#orders",
  },
  {
    label: "پروفایل",
    icon: "/images/navigationbar/user.png",
    href: "#profile",
  },
];

export default function BottomNavigation() {
  return (
    <nav
      aria-label="منوی اصلی"
      className="fixed bottom-0 left-1/2 z-50 h-18 w-full max-w-93.75 -translate-x-1/2 border-t border-[#EEEEEE] bg-white"
      dir="rtl"
    >
      <div className="mx-auto grid h-full w-83 grid-cols-4">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`relative flex flex-col items-center pt-3 no-underline ${
              item.active ? "text-[#FF572D]" : "text-[#B8B8B8]"
            }`}
          >
            {item.active && (
              <span className="absolute -top-px left-1/2 h-1 w-9 -translate-x-1/2 rounded-b-full bg-[#FF572D]" />
            )}
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 object-contain"
            />
            <span className="mt-1 text-[11px] font-normal leading-4">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
