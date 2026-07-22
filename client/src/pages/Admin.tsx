import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import "./AdminRefresh.css";
import "./AdminMobile.css";
import "./PurchaseVouchers.css";
import "./PurchaseInvoices.css";
import "./SalesReports.css";
import "./Expenses.css";
import "./PurchaseControls.css";
import "./ExpenseControls.css";
import "./Inventory.css";
import "./AdminEditorControls.css";
import "./SpecialOffers.css";
import "./SpecialOfferModal.css";
import "./SpecialOfferGrip.css";
import { API_URL } from "../lib/api";

type Category = {
  id: number;
  title: string;
  image: string;
  _count?: { products: number };
};
type Product = {
  id: number;
  title: string;
  image: string;
  price: number;
  discount: number;
  stock: number;
  minStock: number;
  categoryId: number;
  category: Category;
};
type Media = { id: number; image: string; link: string };
type User = { id: number; phone: string; firstName: string | null; lastName: string | null; createdAt: string; isActive: boolean };
type AdminOrder = { id: number; status: "active" | "delivered" | "cancelled"; totalPrice: number; deliveryFee: number; paymentMethod: string; address: string; createdAt: string; user: { id: number; phone: string; firstName: string | null; lastName: string | null }; items: Array<{ id: number; productId: number; title: string; image: string; price: number; discount: number; quantity: number }> };
type PurchaseStatus = "draft" | "approved" | "received" | "cancelled";
type PurchaseVoucher = { id: number; supplierName: string; invoiceNo: string | null; invoiceFile: string | null; notes: string | null; status: PurchaseStatus; totalCost: number; voucherDate: string; createdAt: string; items: Array<{ id: number; productId: number; quantity: number; unitCost: number; product: { id: number; title: string; image: string; stock: number } }> };
type Expense = { id: number; title: string; category: string; amount: number; description: string | null; expenseDate: string; createdAt: string };
type SpecialOffer = { id: number; productId: number; discount: number; label: string; active: boolean; sortOrder: number; startsAt: string | null; endsAt: string | null; salesLimit: number | null; product: Product };
type Overview = {
  products: Product[];
  categories: Category[];
  users: User[];
  banners: Media[];
  sliders: Media[];
  orders: AdminOrder[];
  purchaseVouchers: PurchaseVoucher[];
  expenses: Expense[];
  specialOffers: SpecialOffer[];
};
type Tab = "dashboard" | "products" | "specialOffers" | "categories" | "content" | "users" | "orders" | "purchases" | "reports" | "expenses" | "inventory";

const icons: Record<
  | Tab
  | "logout"
  | "menu"
  | "search"
  | "plus"
  | "edit"
  | "trash"
  | "close"
  | "refresh",
  string
> = {
  dashboard: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  products:
    "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM12 12l8-4.5M12 12 4 7.5M12 12v9",
  specialOffers: "M12 3l2.1 4.4 4.9.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8L5 8.1l4.9-.7L12 3Z",
  categories: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  content: "M4 5h16v14H4V5Zm0 10 4-4 3 3 3-4 6 6M8 9h.01",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  orders: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6M9 16h4",
  purchases: "M3 6h18M5 6l1 14h12l1-14M9 10v6m6-6v6M8 3h8l1 3H7l1-3Z",
  reports: "M4 19V9m5 10V5m5 14v-7m5 7V3M3 21h18",
  expenses: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6",
  inventory: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5 8-4.5M12 12v9M8 9.75l8-4.5",
  logout: "M10 17l5-5-5-5M15 12H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7",
  menu: "M4 6h16M4 12h16M4 18h16",
  search: "m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z",
  trash: "M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7",
  close: "M18 6 6 18M6 6l12 12",
  refresh: "M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7",
};
function Icon({
  name,
  size = 20,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}
function UserAvatarIcon() {
  return (
    <svg
      className="admin-user-avatar-icon"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="11.5" r="5.2" fill="currentColor" />
      <path
        d="M6.5 27c.7-6.1 4.2-9.2 9.5-9.2s8.8 3.1 9.5 9.2c-2.8 1.5-5.9 2.2-9.5 2.2S9.3 28.5 6.5 27Z"
        fill="currentColor"
      />
      <path
        d="M8.3 25.8c1.1-4.2 3.6-6.3 7.7-6.3s6.6 2.1 7.7 6.3"
        stroke="white"
        strokeOpacity=".22"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
const money = (n: number) => n.toLocaleString("fa-IR");
const tabTitles: Record<Tab, string> = {
  dashboard: "نمای کلی",
  products: "محصولات",
  specialOffers: "پیشنهادات ویژه",
  categories: "دسته‌بندی‌ها",
  content: "بنر و اسلایدر",
  users: "کاربران",
  orders: "سفارشات",
  purchases: "حواله‌های خرید",
  reports: "گزارش فروش",
  expenses: "هزینه‌ها",
  inventory: "مدیریت موجودی",
};

// Keep the navigation aligned with the admin's day-to-day workflow:
// sales operations first, then catalogue/stock, finance, content and access.
const sidebarTabs: Tab[] = [
  "dashboard",
  "orders",
  "products",
  "specialOffers",
  "categories",
  "inventory",
  "purchases",
  "expenses",
  "reports",
  "content",
  "users",
];

const ADMIN_SESSION_KEY = "madar_admin_access";

export default function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "granted",
  );
  const login = () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "granted");
    setAuthorized(true);
  };
  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    navigate("/home", { replace: true });
  };
  return authorized ? (
    <AdminPanel onLogout={logout} />
  ) : (
    <AdminLogin onSuccess={login} onBack={() => navigate("/home")} />
  );
}

function AdminLogin({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (code === "1111") onSuccess();
    else {
      setError(true);
      setCode("");
    }
  };
  return (
    <main className="admin-login-page" dir="rtl">
      <section className="admin-login-card">
        <button
          type="button"
          className="admin-login-back"
          onClick={onBack}
          aria-label="بازگشت به فروشگاه"
        >
          ←
        </button>
        <div className="admin-login-logo">
          <img src="/images/header/logo.png" alt="مادر مارکت" />
        </div>
        <small>پنل مدیریت فروشگاه</small>
        <h1>ورود مدیر</h1>
        <p>برای دسترسی به اطلاعات فروشگاه، کد ورود را وارد کنید.</p>
        <form onSubmit={submit}>
          <label htmlFor="admin-code">کد ورود</label>
          <div
            className={error ? "admin-code-field error" : "admin-code-field"}
          >
            <input
              id="admin-code"
              autoFocus
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setError(false);
              }}
              placeholder="••••"
            />
            <span>⌑</span>
          </div>
          {error && <p className="admin-login-error">کد واردشده صحیح نیست.</p>}
          <button className="admin-login-submit" disabled={code.length !== 4}>
            ورود به پنل مدیریت
          </button>
        </form>
        <div className="admin-login-safe">
          <span>✓</span>
          <p>
            دسترسی امن مدیریت
            <small>این دسترسی فقط تا زمان بسته‌شدن مرورگر فعال است.</small>
          </p>
        </div>
      </section>
    </main>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<null | {
    kind: "product" | "category" | "banner" | "slider";
    item?: any;
  }>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { kind: string; id: number; title: string }>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API_URL}/admin/overview`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      setData(await r.json());
    } catch {
      setError(
        "ارتباط با سرور برقرار نشد. مطمئن شوید سرور پروژه در حال اجراست.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 10000);
    const refreshOnFocus = () => void load();
    window.addEventListener("focus", refreshOnFocus);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", refreshOnFocus); };
  }, [load]);
  const filtered = useMemo(
    () =>
      data?.products.filter(
        (p) => p.title.includes(query) || p.category.title.includes(query),
      ) ?? [],
    [data, query],
  );
  const changeTab = (value: Tab) => {
    setTab(value);
    setSidebar(false);
    setQuery("");
  };
  const remove = async () => {
    if (!deleteTarget) return;
    const { kind, id } = deleteTarget;
    setDeleting(true);
    setDeleteError("");
    try {
      const r = await fetch(`${API_URL}/admin/${kind}/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        const result = await r.json().catch(() => ({})) as { error?: string; voucherIds?: number[] };
        if (result.error === "PRODUCT_IN_PURCHASE_VOUCHER") {
          const vouchers = result.voucherIds?.map(value => `#${value}`).join("، ") || "ثبت‌شده";
          setDeleteError(`این محصول در حواله خرید ${vouchers} استفاده شده است. ابتدا محصول را از حواله حذف کنید یا خود حواله را حذف کنید.`);
        } else if (kind === "categories") {
          setDeleteError("این دسته‌بندی دارای محصول است و تا زمانی که محصولات آن منتقل یا حذف نشوند، قابل حذف نیست.");
        } else {
          setDeleteError("حذف انجام نشد. لطفاً دوباره تلاش کنید.");
        }
        return;
      }
      setDeleteTarget(null);
      await load();
    } catch {
      setDeleteError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-shell" dir="rtl">
      <aside className={`admin-sidebar ${sidebar ? "open" : ""}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark">
            <img src="/images/header/logo.png" alt="مادر مارکت" />
          </span>
          <div>
            <strong>مادر مارکت</strong>
            <small>پنل مدیریت</small>
          </div>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebar(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav>
          {sidebarTabs.map((name) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => changeTab(name)}
            >
              <Icon name={name} />
              <span>{tabTitles[name]}</span>
              {name === "products" && <b>{data?.products.length ?? 0}</b>}
              {name === "orders" && <b>{data?.orders.length ?? 0}</b>}
              {name === "purchases" && <b>{data?.purchaseVouchers.length ?? 0}</b>}
              {name === "inventory" && <b>{data?.products.filter(product => product.stock <= product.minStock).length ?? 0}</b>}
            </button>
          ))}
        </nav>
        <div className="admin-side-bottom">
          <div className="admin-profile">
            <span>
              <UserAvatarIcon />
            </span>
            <div>
              <strong>مدیر فروشگاه</strong>
              <small>دسترسی کامل</small>
            </div>
          </div>
          <button className="admin-logout" onClick={() => setShowLogout(true)}>
            <Icon name="logout" />
            <span>خروج از پنل</span>
          </button>
        </div>
      </aside>
      {sidebar && (
        <button
          className="admin-overlay"
          aria-label="بستن منو"
          onClick={() => setSidebar(false)}
        />
      )}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu" onClick={() => setSidebar(true)}>
            <Icon name="menu" />
          </button>
          <div>
            <h1>{tabTitles[tab]}</h1>
            <p>شنبه، ۲۷ تیر ۱۴۰۵</p>
          </div>
          <div className="admin-top-actions">
            <button
              type="button"
              className={`admin-icon-button ${loading ? "refreshing" : ""}`}
              onClick={() => void load()}
              disabled={loading}
              aria-label={loading ? "در حال به‌روزرسانی" : "به‌روزرسانی اطلاعات"}
              data-tooltip={loading ? "در حال به‌روزرسانی..." : "به‌روزرسانی اطلاعات"}
            >
              <Icon name="refresh" />
            </button>
            <div className="admin-avatar">
              <UserAvatarIcon />
              <span />
            </div>
          </div>
        </header>
        <div className="admin-content">
          {loading && !data ? (
            <div className="admin-state">
              <span className="admin-spinner" />
              در حال دریافت اطلاعات...
            </div>
          ) : error ? (
            <div className="admin-state error">
              <p>{error}</p>
              <button onClick={load}>تلاش دوباره</button>
            </div>
          ) : (
            data && (
              <>
                {tab === "dashboard" && (
                  <Dashboard data={data} onNavigate={changeTab} />
                )}
                {tab === "products" && (
                  <Products
                    products={filtered}
                    query={query}
                    setQuery={setQuery}
                    onAdd={() => setModal({ kind: "product" })}
                    onEdit={(p) => setModal({ kind: "product", item: p })}
                    onRemove={(p) => { setDeleteError(""); setDeleteTarget({ kind: "products", id: p.id, title: p.title }); }}
                  />
                )}
                {tab === "specialOffers" && <SpecialOffers items={data.specialOffers} products={data.products} onChanged={load} />}
                {tab === "categories" && (
                  <Categories
                    items={data.categories}
                    onAdd={() => setModal({ kind: "category" })}
                    onEdit={(c) => setModal({ kind: "category", item: c })}
                    onRemove={(c) => { setDeleteError(""); setDeleteTarget({ kind: "categories", id: c.id, title: c.title }); }}
                  />
                )}
                {tab === "content" && (
                  <Content
                    data={data}
                    onAdd={(kind) => setModal({ kind })}
                    onEdit={(kind, item) => setModal({ kind, item })}
                    onRemove={(kind, item) => {
                      setDeleteError(""); setDeleteTarget({
                        kind: `${kind}s`,
                        id: item.id,
                        title: kind === "banner" ? "بنر" : "اسلایدر",
                      });
                    }}
                  />
                )}
                {tab === "users" && <Users items={data.users} />}
                {tab === "orders" && <OrdersAdmin items={data.orders} onChanged={load} />}
                {tab === "purchases" && <PurchaseVouchers items={data.purchaseVouchers} products={data.products} onChanged={load} />}
                {tab === "expenses" && <Expenses items={data.expenses} onChanged={load} />}
                {tab === "inventory" && <Inventory products={data.products} orders={data.orders} vouchers={data.purchaseVouchers} onChanged={load} />}
                {tab === "reports" && <ProfitAndSalesReports orders={data.orders} purchaseVouchers={data.purchaseVouchers} expenses={data.expenses} />}
              </>
            )
          )}
        </div>
      </main>
      {modal && data && (
        <Editor
          modal={modal}
          categories={data.categories}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await load();
          }}
        />
      )}
      {showLogout && <div className="admin-logout-backdrop" role="presentation" onClick={() => setShowLogout(false)}><section className="admin-logout-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-logout-title" onClick={event => event.stopPropagation()}><div className="admin-logout-dialog-icon"><Icon name="logout" size={23} /></div><small>پنل مدیریت مادر مارکت</small><h2 id="admin-logout-title">خروج از پنل مدیریت</h2><p>آیا مطمئن هستید که می‌خواهید از پنل مدیریت خارج شوید؟</p><div className="admin-logout-dialog-actions"><button type="button" onClick={() => setShowLogout(false)}>انصراف</button><button type="button" className="confirm" onClick={onLogout}>خروج از پنل</button></div></section></div>}
      {deleteTarget && <div className="admin-delete-backdrop" role="presentation" onClick={() => !deleting && setDeleteTarget(null)}><section className="admin-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-item-title" onClick={event => event.stopPropagation()}><div className="admin-delete-icon"><Icon name="trash" size={23} /></div><small>{deleteError ? "امکان حذف وجود ندارد" : "عملیات غیرقابل بازگشت"}</small><h2 id="delete-item-title">حذف «{deleteTarget.title}»</h2><p>{deleteError || (deleteTarget.kind === "products" ? "این محصول برای همیشه از فروشگاه حذف می‌شود. آیا از انجام این کار مطمئن هستید؟" : "این مورد برای همیشه حذف می‌شود. آیا از انجام این کار مطمئن هستید؟")}</p><div><button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}>{deleteError ? "متوجه شدم" : "انصراف"}</button>{!deleteError && <button type="button" className="danger" onClick={remove} disabled={deleting}>{deleting ? "در حال حذف..." : "تأیید حذف"}</button>}</div></section></div>}
    </div>
  );
}

function Dashboard({
  data,
  onNavigate,
}: {
  data: Overview;
  onNavigate: (t: Tab) => void;
}) {
  const cards = [
    {
      label: "کل محصولات",
      value: data.products.length,
      sub: "کالا در فروشگاه",
      icon: "products" as Tab,
      color: "orange",
    },
    {
      label: "دسته‌بندی‌ها",
      value: data.categories.length,
      sub: "گروه فعال",
      icon: "categories" as Tab,
      color: "purple",
    },
    {
      label: "کاربران",
      value: data.users.length,
      sub: "کاربر ثبت‌نام‌شده",
      icon: "users" as Tab,
      color: "blue",
    },
    {
      label: "تخفیف‌دارها",
      value: data.products.filter((p) => p.discount > 0).length,
      sub: "پیشنهاد فعال",
      icon: "content" as Tab,
      color: "green",
    },
  ];
  return (
    <>
      <section className="admin-welcome">
        <div>
          <h2>داشبورد مدیریت فروشگاه</h2>
          <p>آخرین وضعیت فروشگاه، آمار کلیدی و ابزارهای مدیریتی را به‌صورت یکپارچه مشاهده و مدیریت کنید.</p>
        </div>
        <button onClick={() => onNavigate("products")}>
          <Icon name="plus" />
          محصول جدید
        </button>
      </section>
      <section className="admin-stats">
        {cards.map((c) => (
          <article key={c.label}>
            <span className={`stat-icon ${c.color}`}>
              <Icon name={c.icon} />
            </span>
            <div>
              <small>{c.label}</small>
              <strong>{money(c.value)}</strong>
              <p>{c.sub}</p>
            </div>
          </article>
        ))}
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <PanelHead
            title="آخرین محصولات"
            action="مشاهده همه"
            onClick={() => onNavigate("products")}
          />
          <ProductRows items={data.products.slice(0, 5)} />
        </section>
        <section className="admin-panel">
          <PanelHead
            title="نمای کلی دسته‌ها"
            action="مشاهده همه"
            onClick={() => onNavigate("categories")}
          />
          <div className="admin-category-summary">
            {data.categories.slice(0, 6).map((c, i) => (
              <div key={c.id}>
                <span
                  style={{
                    background: ["#fff0e8", "#eef5ff", "#f1edff", "#edfaf3"][
                      i % 4
                    ],
                  }}
                >
                  <img src={c.image} alt="" />
                </span>
                <p>
                  {c.title}
                  <small>{money(c._count?.products ?? 0)} محصول</small>
                </p>
                <b>
                  {data.products.length
                    ? Math.round(
                        ((c._count?.products ?? 0) / data.products.length) *
                          100,
                      )
                    : 0}
                  ٪
                </b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
function PanelHead({
  title,
  action,
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="admin-panel-head">
      <h3>{title}</h3>
      {action && <button onClick={onClick}>{action} ←</button>}
    </div>
  );
}
function ProductRows({ items }: { items: Product[] }) {
  return (
    <div className="admin-product-rows">
      {items.map((p) => (
        <div key={p.id}>
          <img src={p.image} alt="" />
          <p>
            {p.title}
            <small>{p.category.title}</small>
          </p>
          <strong>
            {money(p.price)} <small>تومان</small>
          </strong>
          <span className={p.discount ? "discount" : "plain"}>
            {p.discount ? `${money(p.discount)}٪ تخفیف` : "بدون تخفیف"}
          </span>
        </div>
      ))}
    </div>
  );
}

function Products({
  products,
  query,
  setQuery,
  onAdd,
  onEdit,
  onRemove,
}: {
  products: Product[];
  query: string;
  setQuery: (s: string) => void;
  onAdd: () => void;
  onEdit: (p: Product) => void;
  onRemove: (p: Product) => void;
}) {
  return (
    <section className="admin-panel admin-page-panel">
      <div className="admin-toolbar">
        <div className="admin-search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در نام محصول یا دسته..."
          />
        </div>
        <button className="admin-primary" onClick={onAdd}>
          <Icon name="plus" />
          افزودن محصول
        </button>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>محصول</th>
              <th>دسته‌بندی</th>
              <th>قیمت</th>
              <th>تخفیف</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="table-product">
                    <img src={p.image} alt="" />
                    <span>
                      {p.title}
                      <small>کد #{p.id}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="admin-tag">{p.category.title}</span>
                </td>
                <td>
                  <b>{money(p.price)}</b> <small>تومان</small>
                </td>
                <td>
                  {p.discount ? (
                    <span className="table-discount">{money(p.discount)}٪</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => onEdit(p)} title="ویرایش">
                      <Icon name="edit" size={17} />
                    </button>
                    <button
                      className="danger"
                      onClick={() => onRemove(p)}
                      title="حذف"
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && (
          <div className="admin-empty">محصولی با این مشخصات پیدا نشد.</div>
        )}
      </div>
    </section>
  );
}
function Categories({
  items,
  onAdd,
  onEdit,
  onRemove,
}: {
  items: Category[];
  onAdd: () => void;
  onEdit: (i: Category) => void;
  onRemove: (i: Category) => void;
}) {
  return (
    <>
      <div className="admin-section-lead">
        <div>
          <h2>دسته‌بندی محصولات</h2>
          <p>ساختار محصولات فروشگاه را مرتب نگه دارید.</p>
        </div>
        <button className="admin-primary" onClick={onAdd}>
          <Icon name="plus" />
          دسته جدید
        </button>
      </div>
      <div className="admin-category-cards">
        {items.map((c) => (
          <article key={c.id}>
            <div className="category-image">
              <img src={c.image} alt={c.title} />
            </div>
            <div>
              <h3>{c.title}</h3>
              <p>{money(c._count?.products ?? 0)} محصول در این دسته</p>
            </div>
            <div className="category-actions">
              <button onClick={() => onEdit(c)}>
                <Icon name="edit" size={17} />
              </button>
              <button onClick={() => onRemove(c)}>
                <Icon name="trash" size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Content({
  data,
  onAdd,
  onEdit,
  onRemove,
}: {
  data: Overview;
  onAdd: (k: "banner" | "slider") => void;
  onEdit: (k: "banner" | "slider", i: Media) => void;
  onRemove: (k: "banner" | "slider", i: Media) => void;
}) {
  return (
    <div className="content-sections">
      {(["slider", "banner"] as const).map((kind) => (
        <section className="admin-panel" key={kind}>
          <div className="admin-toolbar">
            <div>
              <h3>
                {kind === "slider" ? "اسلایدر صفحه اصلی" : "بنرهای تبلیغاتی"}
              </h3>
              <p>
                {kind === "slider"
                  ? "تصاویر چرخشی ابتدای فروشگاه"
                  : "کمپین‌ها و تبلیغات فروشگاه"}
              </p>
            </div>
            <button
              className="admin-primary secondary"
              onClick={() => onAdd(kind)}
            >
              <Icon name="plus" />
              افزودن
            </button>
          </div>
          <div className="media-grid">
            {data[`${kind}s`].map((m: Media) => (
              <article key={m.id}>
                <img src={m.image} alt="" />
                <div>
                  <span>{m.link || "بدون لینک"}</span>
                  <div>
                    <button onClick={() => onEdit(kind, m)}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button onClick={() => onRemove(kind, m)}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
const adminOrderStatuses: Array<{ value: AdminOrder["status"]; label: string }> = [{ value: "active", label: "در حال آماده‌سازی" }, { value: "delivered", label: "تحویل داده شده" }, { value: "cancelled", label: "لغو شده" }];
function OrderStatusSelect({ value, disabled, onChange }: { value: AdminOrder["status"]; disabled: boolean; onChange: (value: AdminOrder["status"]) => void }) {
  const [open, setOpen] = useState(false);
  return <div className={`admin-status-select ${open ? "open" : ""}`}><button type="button" disabled={disabled} onClick={() => setOpen(current => !current)}><span>{adminOrderStatuses.find(item => item.value === value)?.label}</span><img src="/images/basket/arrow-down.png" alt="" /></button>{open && <div className="admin-status-menu">{adminOrderStatuses.map(item => <button type="button" key={item.value} className={value === item.value ? "active" : ""} onClick={() => { onChange(item.value); setOpen(false); }}>{item.label}{value === item.value && <span>✓</span>}</button>)}</div>}</div>;
}

const purchaseStatusLabels: Record<PurchaseStatus, string> = { draft: "پیش‌نویس", approved: "تأییدشده", received: "دریافت‌شده", cancelled: "لغوشده" };

const expenseCategories = ["اجاره", "حقوق", "حمل‌ونقل", "تبلیغات", "آب و برق", "تعمیرات", "مالیات", "سایر"];

function InventorySortDropdown({ value, onChange }: { value: "stock" | "sales" | "days"; onChange: (value: "stock" | "sales" | "days") => void }) {
  const [open, setOpen] = useState(false);
  const options = [{ value: "stock", label: "کمترین موجودی" }, { value: "sales", label: "بیشترین فروش" }, { value: "days", label: "کمترین روز باقی‌مانده" }] as const;
  return <div className={`inventory-sort-dropdown ${open ? "open" : ""}`}><button type="button" onClick={() => setOpen(current => !current)}><span>{options.find(option => option.value === value)?.label}</span><img src="/images/basket/arrow-down.png" alt="" /></button>{open && <div className="inventory-sort-menu">{options.map(option => <button type="button" key={option.value} className={value === option.value ? "active" : ""} onClick={() => { onChange(option.value); setOpen(false); }}><span>{option.label}</span>{value === option.value && <i>✓</i>}</button>)}</div>}</div>;
}

function SpecialOffers({ items, products, onChanged }: { items: SpecialOffer[]; products: Product[]; onChanged: () => Promise<void> }) {
  const emptyForm = { productId: products[0]?.id ?? 0, discount: products[0]?.discount ?? 0, label: "پیشنهاد ویژه", active: true, sortOrder: items.length + 1, startsAt: "", endsAt: "", salesLimit: "" };
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [deleteOffer, setDeleteOffer] = useState<SpecialOffer | null>(null);
  const [deletingOffer, setDeletingOffer] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  useEffect(() => setOrderedItems(items), [items]);
  const availableProducts = products.filter(product => !items.some(item => item.productId === product.id && item.id !== editingId));
  const selectOffer = (offer: SpecialOffer) => {
    setEditingId(offer.id);
    setForm({ productId: offer.productId, discount: offer.discount, label: offer.label, active: offer.active, sortOrder: offer.sortOrder, startsAt: offer.startsAt?.slice(0, 16) ?? "", endsAt: offer.endsAt?.slice(0, 16) ?? "", salesLimit: offer.salesLimit ? String(offer.salesLimit) : "" });
    setError("");
    setEditorOpen(true);
  };
  const reset = () => {
    const first = products.find(product => !items.some(item => item.productId === product.id));
    setEditingId(null);
    setForm({ ...emptyForm, productId: first?.id ?? 0, discount: first?.discount ?? 0, sortOrder: items.length + 1 });
    setError("");
    setEditorOpen(false);
  };
  const openNew = () => {
    const first = products.find(product => !items.some(item => item.productId === product.id));
    setEditingId(null);
    setForm({ ...emptyForm, productId: first?.id ?? 0, discount: first?.discount ?? 0, sortOrder: items.length + 1 });
    setError("");
    setEditorOpen(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.productId) { setError("ابتدا یک محصول انتخاب کنید."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API_URL}/admin/special-offers${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, salesLimit: form.salesLimit ? Number(form.salesLimit) : null }),
      });
      if (!response.ok) throw new Error();
      await onChanged(); reset();
    } catch { setError("ذخیره پیشنهاد ویژه انجام نشد؛ ممکن است این محصول قبلاً انتخاب شده باشد."); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!deleteOffer) return;
    setDeletingOffer(true);
    try {
      const response = await fetch(`${API_URL}/admin/special-offers/${deleteOffer.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      if (editingId === deleteOffer.id) reset();
      setDeleteOffer(null);
      await onChanged();
    } catch { setError("حذف پیشنهاد ویژه انجام نشد."); setDeleteOffer(null); }
    finally { setDeletingOffer(false); }
  };
  const moveDraggedOffer = (targetId: number) => {
    if (draggingId === null || draggingId === targetId) return;
    setOrderedItems(current => {
      const from = current.findIndex(item => item.id === draggingId);
      const to = current.findIndex(item => item.id === targetId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };
  const saveOrder = async () => {
    if (draggingId === null) return;
    setDraggingId(null);
    setOrdering(true);
    try {
      const response = await fetch(`${API_URL}/admin/special-offers/reorder`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: orderedItems.map(item => item.id) }) });
      if (!response.ok) throw new Error();
      await onChanged();
    } catch { setOrderedItems(items); setError("ذخیره ترتیب پیشنهادات انجام نشد."); }
    finally { setOrdering(false); }
  };
  return <><section className="admin-panel admin-page-panel special-offers-page">
    <div className="admin-toolbar special-offer-toolbar"><div><h3>مدیریت پیشنهادات ویژه</h3><p>محصولات بخش «پیشنهادات ویژه» صفحه Home را انتخاب، مرتب و زمان‌بندی کنید.</p></div><button type="button" className="admin-primary" onClick={openNew}><Icon name="plus" size={15} /> پیشنهاد جدید</button></div>
    <div className="special-offer-list">{ordering && <div className="special-offer-ordering">در حال ذخیره ترتیب جدید...</div>}{orderedItems.map((offer, index) => <article className={`special-offer-card ${offer.active ? "" : "off"} ${draggingId === offer.id ? "dragging" : ""}`} key={offer.id} onDragOver={event => { event.preventDefault(); moveDraggedOffer(offer.id); }} onDrop={event => { event.preventDefault(); void saveOrder(); }}><button type="button" className="special-offer-drag" draggable aria-label={`جابجایی ${offer.product.title}`} onDragStart={event => { setDraggingId(offer.id); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDraggingId(null)}><span /><span /><span /></button><img src={offer.product.image} alt="" /><p><b>{offer.product.title}</b><small>{offer.label}</small></p><div><small>تخفیف ویژه</small><b>{money(offer.discount)}٪</b></div><div><small>ترتیب نمایش</small><b>{money(index + 1)}</b></div><div><small>بازه نمایش</small><b>{offer.startsAt ? new Date(offer.startsAt).toLocaleDateString("fa-IR") : "از همین حالا"}</b><small>{offer.endsAt ? `تا ${new Date(offer.endsAt).toLocaleDateString("fa-IR")}` : "بدون پایان"}</small></div><div><em>{offer.active ? offer.product.stock > 0 ? "فعال" : "ناموجود" : "غیرفعال"}</em></div><div className="special-offer-actions"><button type="button" onClick={() => selectOffer(offer)}><Icon name="edit" size={15} /></button><button type="button" className="danger" onClick={() => setDeleteOffer(offer)}><Icon name="trash" size={15} /></button></div></article>)}{!items.length && <div className="admin-empty">هنوز محصولی برای پیشنهادات ویژه انتخاب نشده است.</div>}</div>
  </section>{editorOpen && <div className="admin-modal-backdrop special-offer-modal-backdrop" role="presentation" onClick={() => !saving && reset()}><section className="admin-modal special-offer-modal" role="dialog" aria-modal="true" aria-labelledby="special-offer-editor-title" onClick={event => event.stopPropagation()}><div className="admin-modal-head"><div><small>{editingId ? "ویرایش پیشنهاد ویژه" : "پیشنهاد ویژه جدید"}</small><h2 id="special-offer-editor-title">{editingId ? "ویرایش تنظیمات محصول" : "افزودن به پیشنهادات ویژه"}</h2></div><button type="button" onClick={reset} disabled={saving}><Icon name="close" size={18} /></button></div><form className="special-offer-form modal-form" onSubmit={save}><label className="wide"><span>محصول</span><PurchaseProductSelect products={availableProducts} value={form.productId} onChange={productId => { const product = products.find(item => item.id === productId); setForm(current => ({ ...current, productId, discount: product?.discount ?? current.discount })); }} /></label><label><span>تخفیف ویژه (درصد)</span><PurchaseNumberInput value={form.discount} min={0} max={100} step={1} onChange={discount => setForm(current => ({ ...current, discount }))} /></label><label><span>ترتیب نمایش</span><PurchaseNumberInput value={form.sortOrder} min={0} step={1} onChange={sortOrder => setForm(current => ({ ...current, sortOrder }))} /></label><label><span>برچسب</span><input value={form.label} onChange={event => setForm(current => ({ ...current, label: event.target.value }))} /></label><label><span>شروع نمایش</span><input type="datetime-local" value={form.startsAt} onChange={event => setForm(current => ({ ...current, startsAt: event.target.value }))} /></label><label><span>پایان نمایش</span><input type="datetime-local" value={form.endsAt} onChange={event => setForm(current => ({ ...current, endsAt: event.target.value }))} /></label><label><span>سقف فروش (اختیاری)</span><PurchaseNumberInput value={Number(form.salesLimit) || 0} min={0} step={1} onChange={salesLimit => setForm(current => ({ ...current, salesLimit: salesLimit > 0 ? String(salesLimit) : "" }))} /></label><label className="special-offer-check"><input type="checkbox" checked={form.active} onChange={event => setForm(current => ({ ...current, active: event.target.checked }))} /><span>فعال و قابل نمایش</span></label>{error && <p className="form-error wide">{error}</p>}<div className="special-offer-form-actions wide"><button type="button" onClick={reset} disabled={saving}>انصراف</button><button className="save" disabled={saving}>{saving ? "در حال ذخیره..." : editingId ? "ذخیره تغییرات" : "افزودن پیشنهاد"}</button></div></form></section></div>}{deleteOffer && <div className="admin-delete-backdrop" role="presentation" onClick={() => !deletingOffer && setDeleteOffer(null)}><section className="admin-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-special-offer-title" onClick={event => event.stopPropagation()}><div className="admin-delete-icon"><Icon name="trash" size={23} /></div><small>حذف از پیشنهادات ویژه</small><h2 id="delete-special-offer-title">حذف «{deleteOffer.product.title}»</h2><p>این محصول فقط از بخش پیشنهادات ویژه حذف می‌شود و خود محصول و اطلاعات آن باقی می‌ماند.</p><div><button type="button" onClick={() => setDeleteOffer(null)} disabled={deletingOffer}>انصراف</button><button type="button" className="danger" onClick={() => void remove()} disabled={deletingOffer}>{deletingOffer ? "در حال حذف..." : "حذف از پیشنهادات"}</button></div></section></div>}</>;
}

function Inventory({ products, orders, vouchers, onChanged }: { products: Product[]; orders: AdminOrder[]; vouchers: PurchaseVoucher[]; onChanged: () => Promise<void> }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState<"all" | "enough" | "low" | "empty">("all"); const [sort, setSort] = useState<"stock" | "sales" | "days">("stock"); const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null); const [savingId, setSavingId] = useState<number | null>(null);
  const since = new Date(); since.setDate(since.getDate() - 30);
  const rows = products.map(product => { const sold = orders.filter(order => order.status === "delivered" && new Date(order.createdAt) >= since).reduce((sum, order) => sum + (order.items.find(item => item.productId === product.id)?.quantity ?? 0), 0); const daily = sold / 30; const days = daily > 0 ? Math.floor(product.stock / daily) : null; const inventoryStatus = product.stock <= 0 ? "empty" : product.stock <= product.minStock ? "low" : "enough"; const purchaseItems = vouchers.filter(voucher => voucher.status === "received").flatMap(voucher => voucher.items.filter(item => item.productId === product.id).map(item => ({ voucher, item }))).sort((a, b) => new Date(b.voucher.voucherDate).getTime() - new Date(a.voucher.voucherDate).getTime()); const last = purchaseItems[0]; return { product, sold, daily, days, inventoryStatus, last }; });
  const visible = rows.filter(row => (status === "all" || row.inventoryStatus === status) && (!query.trim() || row.product.title.includes(query.trim()) || row.product.category.title.includes(query.trim()))).sort((a, b) => sort === "sales" ? b.sold - a.sold : sort === "days" ? (a.days ?? 99999) - (b.days ?? 99999) : a.product.stock - b.product.stock);
  const saveMinStock = async (product: Product, minStock: number) => { setSavingId(product.id); try { const response = await fetch(`${API_URL}/admin/products/${product.id}/inventory`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minStock }) }); if (!response.ok) throw new Error(); await onChanged(); } catch { alert("حداقل موجودی ذخیره نشد."); } finally { setSavingId(null); } };
  return <><section className="admin-panel admin-page-panel inventory-page"><div className="admin-toolbar"><div><h3>مدیریت موجودی کالا</h3><p>{money(rows.filter(row => row.inventoryStatus === "low").length)} رو به اتمام • {money(rows.filter(row => row.inventoryStatus === "empty").length)} ناموجود</p></div></div><div className="inventory-summary"><article className="all"><b>{money(products.reduce((sum, product) => sum + product.stock, 0))}</b><span>کل واحد موجود</span></article><article className="enough"><b>{money(rows.filter(row => row.inventoryStatus === "enough").length)}</b><span>موجودی کافی</span></article><article className="low"><b>{money(rows.filter(row => row.inventoryStatus === "low").length)}</b><span>رو به اتمام</span></article><article className="empty"><b>{money(rows.filter(row => row.inventoryStatus === "empty").length)}</b><span>ناموجود</span></article></div><div className="inventory-filters"><label><Icon name="search" size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی کالا یا دسته‌بندی" /></label><div>{(["all", "enough", "low", "empty"] as const).map(value => <button className={status === value ? "active" : ""} onClick={() => setStatus(value)} key={value}>{value === "all" ? "همه" : value === "enough" ? "موجودی کافی" : value === "low" ? "رو به اتمام" : "ناموجود"}</button>)}</div><InventorySortDropdown value={sort} onChange={setSort} /></div><div className="inventory-list">{visible.map(row => <article key={row.product.id} className={`inventory-card ${row.inventoryStatus}`}><div className="inventory-product"><img src={row.product.image} alt="" /><p><b>{row.product.title}</b><small>{row.product.category.title}</small></p></div><div className="inventory-stock"><span>موجودی فعلی</span><b>{money(row.product.stock)} <small>عدد</small></b><em>{row.inventoryStatus === "empty" ? "ناموجود" : row.inventoryStatus === "low" ? "رو به اتمام" : "کافی"}</em></div><div className="inventory-metric"><span>فروش ۳۰ روز</span><b>{money(row.sold)} عدد</b><small>میانگین {row.daily.toLocaleString("fa-IR", { maximumFractionDigits: 1 })} در روز</small></div><div className="inventory-metric"><span>زمان باقی‌مانده</span><b>{row.days === null ? "بدون سابقه فروش" : `${money(row.days)} روز`}</b><small>{row.last ? `آخرین خرید: ${money(row.last.item.unitCost)} تومان` : "خریدی ثبت نشده"}</small></div><div className="inventory-metric"><span>آخرین تأمین‌کننده</span><b>{row.last?.voucher.supplierName ?? "—"}</b><small>{row.last ? new Date(row.last.voucher.voucherDate).toLocaleDateString("fa-IR") : "بدون حواله"}</small></div><div className="inventory-min"><span>حداقل موجودی</span><PurchaseNumberInput value={row.product.minStock} min={0} step={1} onChange={value => saveMinStock(row.product, value)} /><small>{savingId === row.product.id ? "در حال ذخیره..." : "مبنای هشدار خرید"}</small></div><button className="inventory-buy" onClick={() => setPurchaseProduct(row.product)}><Icon name="plus" size={15} /> ثبت حواله خرید</button></article>)}{!visible.length && <div className="admin-empty">کالایی مطابق فیلتر انتخاب‌شده وجود ندارد.</div>}</div></section>{purchaseProduct && <PurchaseVoucherEditor voucher={null} products={products} initialProductId={purchaseProduct.id} onClose={() => setPurchaseProduct(null)} onSaved={async () => { setPurchaseProduct(null); await onChanged(); }} />}</>;
}

function ExpenseCategoryDropdown({ value, onChange, includeAll = false }: { value: string; onChange: (value: string) => void; includeAll?: boolean }) {
  const [open, setOpen] = useState(false); const options = includeAll ? ["all", ...expenseCategories] : expenseCategories; const label = value === "all" ? "همه دسته‌ها" : value;
  return <div className={`expense-category-dropdown ${open ? "open" : ""}`}><button type="button" onClick={() => setOpen(current => !current)}><span>{label}</span><img src="/images/basket/arrow-down.png" alt="" /></button>{open && <div className="expense-category-menu">{options.map(option => <button type="button" key={option} className={value === option ? "active" : ""} onClick={() => { onChange(option); setOpen(false); }}><span>{option === "all" ? "همه دسته‌ها" : option}</span>{value === option && <i>✓</i>}</button>)}</div>}</div>;
}
function Expenses({ items, onChanged }: { items: Expense[]; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState<Expense | "new" | null>(null); const [query, setQuery] = useState(""); const [category, setCategory] = useState("all"); const [busy, setBusy] = useState<number | null>(null); const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const visible = items.filter(item => (category === "all" || item.category === category) && (!query.trim() || item.title.includes(query.trim()) || item.description?.includes(query.trim())));
  const remove = async () => { if (!deleteTarget) return; setBusy(deleteTarget.id); try { const response = await fetch(`${API_URL}/admin/expenses/${deleteTarget.id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); setDeleteTarget(null); await onChanged(); } catch { alert("حذف هزینه انجام نشد."); } finally { setBusy(null); } };
  return <><section className="admin-panel admin-page-panel expenses-page"><div className="admin-toolbar"><div><h3>مدیریت هزینه‌های فروشگاه</h3><p>{money(visible.reduce((sum, item) => sum + item.amount, 0))} تومان در نتایج فعلی</p></div><button className="admin-primary" onClick={() => setEditing("new")}><Icon name="plus" size={15} /> ثبت هزینه</button></div><div className="expense-filters"><label><Icon name="search" size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="جست‌وجوی عنوان یا توضیحات" /></label><ExpenseCategoryDropdown value={category} onChange={setCategory} includeAll /></div><div className="expense-list">{visible.map(item => <article key={item.id}><span className="expense-icon">−</span><div><b>{item.title}</b><small>{new Date(item.expenseDate).toLocaleDateString("fa-IR")} • {item.category}</small>{item.description && <p>{item.description}</p>}</div><strong>{money(item.amount)} <small>تومان</small></strong><div className="expense-actions"><button onClick={() => setEditing(item)}><Icon name="edit" size={15} /></button><button className="danger" onClick={() => setDeleteTarget(item)}><Icon name="trash" size={15} /></button></div></article>)}{!visible.length && <div className="admin-empty">هزینه‌ای ثبت نشده است.</div>}</div></section>{editing && <ExpenseEditor item={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await onChanged(); }} />}{deleteTarget && <div className="admin-delete-backdrop" onClick={() => busy === null && setDeleteTarget(null)}><section className="admin-delete-dialog" onClick={event => event.stopPropagation()}><div className="admin-delete-icon"><Icon name="trash" size={23} /></div><small>حذف هزینه</small><h2>{deleteTarget.title}</h2><p>این هزینه از محاسبات سود و زیان حذف خواهد شد.</p><div><button onClick={() => setDeleteTarget(null)} disabled={busy !== null}>انصراف</button><button className="danger" onClick={remove} disabled={busy !== null}>{busy ? "در حال حذف..." : "حذف هزینه"}</button></div></section></div>}</>;
}

function ExpenseEditor({ item, onClose, onSaved }: { item: Expense | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState(item?.title ?? ""); const [category, setCategory] = useState(item?.category ?? expenseCategories[0]); const [amount, setAmount] = useState(item?.amount ?? 0); const [description, setDescription] = useState(item?.description ?? ""); const [expenseDate, setExpenseDate] = useState(item ? new Date(item.expenseDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!title.trim() || amount <= 0) { setError("عنوان و مبلغ معتبر را وارد کنید."); return; } setSaving(true); setError(""); try { const response = await fetch(`${API_URL}/admin/expenses${item ? `/${item.id}` : ""}`, { method: item ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), category, amount, description: description.trim(), expenseDate }) }); if (!response.ok) throw new Error(); await onSaved(); } catch { setError("ذخیره هزینه انجام نشد."); } finally { setSaving(false); } };
  return <div className="admin-modal-backdrop" onClick={onClose}><section className="admin-modal expense-editor" onClick={event => event.stopPropagation()}><div className="admin-modal-head"><div><small>{item ? "ویرایش هزینه" : "هزینه جدید"}</small><h2>{item ? item.title : "ثبت هزینه فروشگاه"}</h2></div><button onClick={onClose}><Icon name="close" /></button></div><form className="admin-form" onSubmit={submit}><label>عنوان هزینه<input value={title} onChange={event => setTitle(event.target.value)} placeholder="مثلاً اجاره فروشگاه" /></label><div className="form-row"><label>دسته‌بندی<ExpenseCategoryDropdown value={category} onChange={setCategory} /></label><label>مبلغ (تومان)<PurchaseNumberInput value={amount} min={0} step={10000} moneyValue onChange={setAmount} /></label></div><label>تاریخ هزینه<input type="date" value={expenseDate} onChange={event => setExpenseDate(event.target.value)} /></label><label>توضیحات<textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} placeholder="اختیاری" /></label>{error && <p className="form-error">{error}</p>}<div className="admin-modal-actions"><button type="button" onClick={onClose}>انصراف</button><button className="admin-primary" disabled={saving}>{saving ? "در حال ذخیره..." : "ذخیره هزینه"}</button></div></form></section></div>;
}

export function SalesReports({ orders, products, purchaseVouchers, expenses }: { orders: AdminOrder[]; products: Product[]; purchaseVouchers: PurchaseVoucher[]; expenses: Expense[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const dateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const setPeriod = (period: "today" | "week" | "month" | "year") => { const end = new Date(); const start = new Date(end); if (period === "week") start.setDate(end.getDate() - ((end.getDay() + 1) % 7)); if (period === "month") start.setDate(1); if (period === "year") { start.setMonth(0); start.setDate(1); } setFrom(dateInput(start)); setTo(dateInput(end)); };
  const inRange = (dateText: string, start: string, end: string) => { const value = new Date(dateText); if (start && value < new Date(`${start}T00:00:00`)) return false; if (end && value > new Date(`${end}T23:59:59.999`)) return false; return true; };
  const filtered = useMemo(() => orders.filter(order => inRange(order.createdAt, from, to)), [orders, from, to]);
  const delivered = filtered.filter(order => order.status === "delivered");
  const revenue = delivered.reduce((sum, order) => sum + order.totalPrice, 0);
  const totalItems = delivered.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const averageOrder = delivered.length ? Math.round(revenue / delivered.length) : 0;
  const productSales = delivered.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => { const finalPrice = Math.floor((item.price * (1 - item.discount / 100)) / 500) * 500; return itemSum + finalPrice * item.quantity; }, 0), 0);
  const weightedCost = (productId: number, saleDate: string) => { let quantity = 0; let cost = 0; for (const voucher of purchaseVouchers) { if (voucher.status !== "received" || new Date(voucher.voucherDate) > new Date(saleDate)) continue; for (const item of voucher.items) if (item.productId === productId) { quantity += item.quantity; cost += item.quantity * item.unitCost; } } return quantity ? cost / quantity : 0; };
  const costOfGoods = Math.round(delivered.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + weightedCost(item.productId, order.createdAt) * item.quantity, 0), 0));
  const unknownCostItems = delivered.reduce((sum, order) => sum + order.items.filter(item => weightedCost(item.productId, order.createdAt) === 0).reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const periodExpenses = expenses.filter(expense => inRange(expense.expenseDate, from, to));
  const expenseTotal = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grossProfit = productSales - costOfGoods;
  const netProfit = grossProfit - expenseTotal;
  const profitMargin = productSales ? Math.round((netProfit / productSales) * 1000) / 10 : 0;
  const previousRevenue = useMemo(() => { if (!from || !to) return null; const start = new Date(`${from}T00:00:00`); const end = new Date(`${to}T23:59:59.999`); const duration = end.getTime() - start.getTime() + 1; const previousEnd = new Date(start.getTime() - 1); const previousStart = new Date(previousEnd.getTime() - duration + 1); return orders.filter(order => order.status === "delivered" && new Date(order.createdAt) >= previousStart && new Date(order.createdAt) <= previousEnd).reduce((sum, order) => sum + order.totalPrice, 0); }, [orders, from, to]);
  const change = previousRevenue === null ? null : previousRevenue === 0 ? (revenue > 0 ? 100 : 0) : Math.round(((revenue - previousRevenue) / previousRevenue) * 100);
  const analytics = useMemo(() => {
    const daily = new Map<string, number>(); const productMap = new Map<number, { title: string; quantity: number; revenue: number }>(); const customerMap = new Map<number, { name: string; phone: string; orders: number; revenue: number }>(); const categoryMap = new Map<string, number>(); const productCategories = new Map(products.map(product => [product.id, product.category.title]));
    for (const order of delivered) { const day = new Date(order.createdAt).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }); daily.set(day, (daily.get(day) ?? 0) + order.totalPrice); const customer = customerMap.get(order.user.id) ?? { name: `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() || `کاربر #${order.user.id}`, phone: order.user.phone, orders: 0, revenue: 0 }; customer.orders += 1; customer.revenue += order.totalPrice; customerMap.set(order.user.id, customer); for (const item of order.items) { const finalPrice = Math.floor((item.price * (1 - item.discount / 100)) / 500) * 500; const product = productMap.get(item.productId) ?? { title: item.title, quantity: 0, revenue: 0 }; product.quantity += item.quantity; product.revenue += finalPrice * item.quantity; productMap.set(item.productId, product); const category = productCategories.get(item.productId) ?? "بدون دسته‌بندی"; categoryMap.set(category, (categoryMap.get(category) ?? 0) + finalPrice * item.quantity); } }
    return { daily: [...daily.entries()], products: [...productMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5), customers: [...customerMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5), categories: [...categoryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6) };
  }, [delivered, products]);
  const maxDaily = Math.max(...analytics.daily.map(([, value]) => value), 1);
  const exportCsv = () => { const rows = [["شماره سفارش", "تاریخ", "مشتری", "موبایل", "وضعیت", "تعداد کالا", "مبلغ کل"], ...filtered.map(order => [order.id, new Date(order.createdAt).toLocaleDateString("fa-IR"), `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() || `کاربر ${order.user.id}`, order.user.phone, order.status === "delivered" ? "تحویل‌شده" : order.status === "active" ? "جاری" : "لغوشده", order.items.reduce((sum, item) => sum + item.quantity, 0), order.totalPrice])]; const csv = "\uFEFF" + rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `sales_report_${from || "all"}_${to || "all"}.csv`; anchor.click(); URL.revokeObjectURL(url); };
  const printReport = () => { const oldTitle = document.title; document.title = `sales_report_${from || "all"}_${to || "all"}`; window.addEventListener("afterprint", () => { document.title = oldTitle; }, { once: true }); window.print(); };
  void setPeriod; void unknownCostItems; void profitMargin;
  return <section className="sales-report-page"><div className="sales-report-head"><div><small>تحلیل عملکرد فروشگاه</small><h2>گزارش فروش</h2><p>فروش قطعی فقط براساس سفارش‌های تحویل‌شده محاسبه می‌شود.</p></div><div className="sales-report-actions"><button onClick={exportCsv}>خروجی CSV</button><button className="print" onClick={printReport}>چاپ / PDF</button></div></div><div className="sales-date-filter"><label><span>از تاریخ</span><input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label><span>تا تاریخ</span><input type="date" value={to} onChange={event => setTo(event.target.value)} /></label><button onClick={() => { setFrom(""); setTo(""); }}>نمایش همه فروش‌ها</button></div><div className="sales-kpis"><article><span>فروش قطعی</span><b>{money(revenue)} <small>تومان</small></b>{change !== null && <em className={change >= 0 ? "up" : "down"}>{change >= 0 ? "↑" : "↓"} {money(Math.abs(change))}٪ نسبت به بازه قبل</em>}</article><article><span>سفارش تحویل‌شده</span><b>{money(delivered.length)}</b><small>از {money(filtered.length)} سفارش</small></article><article><span>میانگین مبلغ سفارش</span><b>{money(averageOrder)} <small>تومان</small></b></article><article><span>کالای فروخته‌شده</span><b>{money(totalItems)}</b><small>عدد کالا</small></article></div><div className="sales-status-strip"><div className="active"><b>{money(filtered.filter(order => order.status === "active").length)}</b><span>سفارش جاری</span></div><div className="delivered"><b>{money(delivered.length)}</b><span>تحویل‌شده</span></div><div className="cancelled"><b>{money(filtered.filter(order => order.status === "cancelled").length)}</b><span>لغوشده</span></div></div><div className="sales-chart-panel"><header><div><h3>روند فروش روزانه</h3><p>مبلغ سفارش‌های تحویل‌شده در هر روز</p></div></header>{analytics.daily.length ? <div className="sales-chart-scroll"><div className="sales-bars" style={{ minWidth: `${Math.max(analytics.daily.length * 62, 560)}px` }}>{analytics.daily.map(([label, value]) => <div className="sales-bar" key={label}><span>{money(value)}</span><i style={{ height: `${Math.max((value / maxDaily) * 180, 5)}px` }} /><b>{label}</b></div>)}</div></div> : <div className="sales-empty-chart">در این بازه فروش تحویل‌شده‌ای وجود ندارد.</div>}</div><div className="sales-report-grid"><section><header><h3>محصولات پرفروش</h3><span>براساس تعداد</span></header>{analytics.products.map((item, index) => <div className="sales-rank-row" key={item.title}><i>{money(index + 1)}</i><p><b>{item.title}</b><small>{money(item.revenue)} تومان فروش</small></p><strong>{money(item.quantity)} عدد</strong></div>)}{!analytics.products.length && <div className="sales-list-empty">داده‌ای وجود ندارد.</div>}</section><section><header><h3>مشتریان برتر</h3><span>براساس مبلغ خرید</span></header>{analytics.customers.map((item, index) => <div className="sales-rank-row" key={item.phone}><i>{money(index + 1)}</i><p><b>{item.name}</b><small dir="ltr">{item.phone}</small></p><strong>{money(item.revenue)} تومان</strong></div>)}{!analytics.customers.length && <div className="sales-list-empty">داده‌ای وجود ندارد.</div>}</section><section className="sales-categories"><header><h3>فروش دسته‌بندی‌ها</h3><span>سهم از فروش کالاها</span></header>{analytics.categories.map(([name, value]) => <div key={name}><p><span>{name}</span><b>{money(value)} تومان</b></p><i><span style={{ width: `${revenue ? Math.min((value / revenue) * 100, 100) : 0}%` }} /></i></div>)}{!analytics.categories.length && <div className="sales-list-empty">داده‌ای وجود ندارد.</div>}</section></div><footer className="sales-report-footer">گزارش تولیدشده توسط پنل مدیریت مادر مارکت • {new Date().toLocaleDateString("fa-IR")}</footer></section>;
}

function ProfitAndSalesReports({ orders, purchaseVouchers, expenses }: { orders: AdminOrder[]; purchaseVouchers: PurchaseVoucher[]; expenses: Expense[] }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const inRange = (text: string) => { const date = new Date(text); return (!from || date >= new Date(`${from}T00:00:00`)) && (!to || date <= new Date(`${to}T23:59:59.999`)); };
  const setPeriod = (period: "today" | "week" | "month" | "year") => { const end = new Date(); const start = new Date(end); if (period === "week") start.setDate(end.getDate() - ((end.getDay() + 1) % 7)); if (period === "month") start.setDate(1); if (period === "year") { start.setMonth(0); start.setDate(1); } setFrom(localDate(start)); setTo(localDate(end)); };
  const filteredOrders = orders.filter(order => inRange(order.createdAt)); const delivered = filteredOrders.filter(order => order.status === "delivered"); const filteredExpenses = expenses.filter(expense => inRange(expense.expenseDate));
  const unitCostAt = (productId: number, saleDate: string) => { let quantity = 0; let total = 0; for (const voucher of purchaseVouchers) { if (voucher.status !== "received" || new Date(voucher.voucherDate) > new Date(saleDate)) continue; for (const item of voucher.items) if (item.productId === productId) { quantity += item.quantity; total += item.quantity * item.unitCost; } } return quantity ? total / quantity : 0; };
  const orderProductSales = (order: AdminOrder) => order.items.reduce((sum, item) => sum + (Math.floor((item.price * (1 - item.discount / 100)) / 500) * 500) * item.quantity, 0);
  const orderCost = (order: AdminOrder) => order.items.reduce((sum, item) => sum + unitCostAt(item.productId, order.createdAt) * item.quantity, 0);
  const productSales = delivered.reduce((sum, order) => sum + orderProductSales(order), 0); const totalRevenue = delivered.reduce((sum, order) => sum + order.totalPrice, 0); const cogs = Math.round(delivered.reduce((sum, order) => sum + orderCost(order), 0)); const expenseTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0); const grossProfit = productSales - cogs; const netProfit = grossProfit - expenseTotal; const margin = productSales ? Math.round(netProfit / productSales * 1000) / 10 : 0; const unknownCosts = delivered.reduce((sum, order) => sum + order.items.filter(item => unitCostAt(item.productId, order.createdAt) === 0).reduce((n, item) => n + item.quantity, 0), 0);
  const monthly = useMemo(() => { const map = new Map<string, { label: string; sales: number; cost: number; expenses: number }>(); const keyOf = (text: string) => { const date = new Date(text); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }; const labelOf = (text: string) => new Date(text).toLocaleDateString("fa-IR", { year: "numeric", month: "long" }); for (const order of delivered) { const key = keyOf(order.createdAt); const row = map.get(key) ?? { label: labelOf(order.createdAt), sales: 0, cost: 0, expenses: 0 }; row.sales += orderProductSales(order); row.cost += orderCost(order); map.set(key, row); } for (const expense of filteredExpenses) { const key = keyOf(expense.expenseDate); const row = map.get(key) ?? { label: labelOf(expense.expenseDate), sales: 0, cost: 0, expenses: 0 }; row.expenses += expense.amount; map.set(key, row); } return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, row]) => ({ ...row, profit: Math.round(row.sales - row.cost - row.expenses) })); }, [delivered, filteredExpenses, purchaseVouchers]);
  const expenseGroups = useMemo(() => { const map = new Map<string, number>(); for (const item of filteredExpenses) map.set(item.category, (map.get(item.category) ?? 0) + item.amount); return [...map.entries()].sort((a, b) => b[1] - a[1]); }, [filteredExpenses]);
  const exportCsv = () => { const rows = [["دوره", "فروش کالا", "بهای تمام‌شده", "سود ناخالص", "هزینه‌ها", "سود خالص"], ...monthly.map(row => [row.label, Math.round(row.sales), Math.round(row.cost), Math.round(row.sales - row.cost), row.expenses, row.profit]), ["جمع کل", productSales, cogs, grossProfit, expenseTotal, netProfit]]; const csv = "\uFEFF" + rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\r\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `profit_loss_${from || "all"}_${to || "all"}.csv`; link.click(); URL.revokeObjectURL(url); };
  const printReport = () => { const old = document.title; document.title = `profit_loss_${from || "all"}_${to || "all"}`; window.addEventListener("afterprint", () => { document.title = old; }, { once: true }); window.print(); };
  return <section className="profit-report sales-report-page"><div className="sales-report-head"><div><small>حسابداری مدیریتی</small><h2>گزارش فروش و سود و زیان</h2><p>بهای کالا با روش میانگین موزون حواله‌های دریافت‌شده محاسبه می‌شود.</p></div><div className="sales-report-actions"><button onClick={exportCsv}>خروجی CSV</button><button className="print" onClick={printReport}>چاپ / PDF</button></div></div><div className="sales-period-presets"><button onClick={() => setPeriod("today")}>امروز</button><button onClick={() => setPeriod("week")}>این هفته</button><button onClick={() => setPeriod("month")}>این ماه</button><button onClick={() => setPeriod("year")}>امسال</button><button className={!from && !to ? "active" : ""} onClick={() => { setFrom(""); setTo(""); }}>همه دوره‌ها</button></div><div className="sales-date-filter"><label><span>از تاریخ</span><input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label><span>تا تاریخ</span><input type="date" value={to} onChange={event => setTo(event.target.value)} /></label><span className="report-range-count">{money(delivered.length)} فروش قطعی در این بازه</span></div><div className="profit-kpis"><article><span>فروش خالص کالا</span><b>{money(productSales)} <small>تومان</small></b></article><article><span>بهای تمام‌شده</span><b>{money(cogs)} <small>تومان</small></b></article><article><span>سود ناخالص</span><b className={grossProfit >= 0 ? "positive" : "negative"}>{money(grossProfit)} <small>تومان</small></b></article><article><span>هزینه‌های عملیاتی</span><b>{money(expenseTotal)} <small>تومان</small></b></article><article className="net"><span>سود / زیان خالص</span><b className={netProfit >= 0 ? "positive" : "negative"}>{money(netProfit)} <small>تومان</small></b><em>٪{money(margin)} حاشیه سود</em></article></div>{unknownCosts > 0 && <div className="profit-warning">برای {money(unknownCosts)} عدد کالای فروخته‌شده، حواله خرید دریافت‌شده قبل از تاریخ فروش وجود ندارد؛ بهای آن‌ها صفر در نظر گرفته شده است.</div>}<div className="sales-status-strip"><div className="active"><b>{money(filteredOrders.filter(order => order.status === "active").length)}</b><span>سفارش جاری</span></div><div className="delivered"><b>{money(delivered.length)}</b><span>تحویل‌شده</span></div><div className="cancelled"><b>{money(filteredOrders.filter(order => order.status === "cancelled").length)}</b><span>لغوشده</span></div><div><b>{money(totalRevenue)}</b><span>دریافتی با ارسال</span></div></div><div className="profit-monthly"><header><div><h3>گزارش دوره‌ای</h3><p>خلاصه ماهانه فروش، هزینه و سود خالص</p></div></header><div className="profit-table-wrap"><table><thead><tr><th>ماه</th><th>فروش کالا</th><th>بهای کالا</th><th>سود ناخالص</th><th>هزینه‌ها</th><th>سود خالص</th></tr></thead><tbody>{monthly.map(row => <tr key={row.label}><td>{row.label}</td><td>{money(row.sales)}</td><td>{money(Math.round(row.cost))}</td><td>{money(Math.round(row.sales - row.cost))}</td><td>{money(row.expenses)}</td><td className={row.profit >= 0 ? "positive" : "negative"}>{money(row.profit)}</td></tr>)}</tbody></table>{!monthly.length && <div className="sales-list-empty">داده‌ای برای گزارش این بازه وجود ندارد.</div>}</div></div><div className="profit-bottom-grid"><section><header><h3>تفکیک هزینه‌ها</h3><span>{money(expenseTotal)} تومان</span></header>{expenseGroups.map(([name, value]) => <div className="expense-breakdown" key={name}><p><b>{name}</b><span>{money(value)} تومان</span></p><i><span style={{ width: `${expenseTotal ? value / expenseTotal * 100 : 0}%` }} /></i></div>)}{!expenseGroups.length && <div className="sales-list-empty">هزینه‌ای در این بازه ثبت نشده است.</div>}</section><section><header><h3>روش محاسبه</h3></header><div className="profit-formula"><p><span>سود ناخالص</span><b>فروش کالا − بهای تمام‌شده</b></p><p><span>سود خالص</span><b>سود ناخالص − هزینه‌های عملیاتی</b></p><p><span>روش قیمت خرید</span><b>میانگین موزون حواله‌های دریافت‌شده</b></p></div></section></div><footer className="sales-report-footer">گزارش سود و زیان مادر مارکت • {new Date().toLocaleDateString("fa-IR")}</footer></section>;
}

function PurchaseVouchers({ items, products, onChanged }: { items: PurchaseVoucher[]; products: Product[]; onChanged: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PurchaseStatus | "all">("all");
  const [editor, setEditor] = useState<PurchaseVoucher | "new" | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<PurchaseVoucher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseVoucher | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const visible = items.filter(item => (status === "all" || item.status === status) && (!query.trim() || item.supplierName.includes(query.trim()) || item.invoiceNo?.includes(query.trim()) || String(item.id) === query.trim()));
  const changeStatus = async (voucher: PurchaseVoucher, next: PurchaseStatus) => { setBusy(voucher.id); try { const response = await fetch(`${API_URL}/admin/purchase-vouchers/${voucher.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) }); if (!response.ok) throw new Error(); await onChanged(); } catch { alert("تغییر وضعیت حواله انجام نشد."); } finally { setBusy(null); } };
  const remove = async () => { if (!deleteTarget) return; setBusy(deleteTarget.id); try { const response = await fetch(`${API_URL}/admin/purchase-vouchers/${deleteTarget.id}`, { method: "DELETE" }); if (!response.ok) throw new Error(); setDeleteTarget(null); await onChanged(); } catch { alert("حذف حواله انجام نشد."); } finally { setBusy(null); } };
  return <><section className="admin-panel admin-page-panel purchase-page"><div className="admin-toolbar purchase-toolbar"><div><h3>حواله‌های خرید کالا</h3><p>{money(visible.length)} حواله از {money(items.length)} حواله</p></div><button className="admin-primary" onClick={() => setEditor("new")}><Icon name="plus" size={16} /> حواله جدید</button></div><div className="purchase-filters"><label><Icon name="search" size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="تأمین‌کننده، فاکتور یا شماره حواله" /></label><div>{(["all", "draft", "approved", "received", "cancelled"] as const).map(value => <button type="button" key={value} className={status === value ? "active" : ""} onClick={() => setStatus(value)}>{value === "all" ? "همه" : purchaseStatusLabels[value]}</button>)}</div></div><div className="purchase-list">{visible.map(voucher => <article className="purchase-card" key={voucher.id}><header><div><b>حواله خرید #{voucher.id}</b><small>{new Date(voucher.voucherDate).toLocaleDateString("fa-IR")}{voucher.invoiceNo ? ` • فاکتور ${voucher.invoiceNo}` : ""}</small></div><span className={`purchase-status ${voucher.status}`}>{purchaseStatusLabels[voucher.status]}</span></header><div className="purchase-supplier"><span>تأمین‌کننده</span><b>{voucher.supplierName}</b></div><div className="purchase-items">{voucher.items.map(item => <div key={item.id}><img src={item.product.image} alt="" /><p><b>{item.product.title}</b><small>{money(item.quantity)} عدد × {money(item.unitCost)} تومان</small></p><strong>{money(item.quantity * item.unitCost)} <small>تومان</small></strong></div>)}</div>{voucher.notes && <p className="purchase-notes">یادداشت: {voucher.notes}</p>}<div className="purchase-total"><span>{money(voucher.items.reduce((sum, item) => sum + item.quantity, 0))} قلم کالا</span><b>{money(voucher.totalCost)} <small>تومان</small></b></div><footer><div className="purchase-status-actions">{(["draft", "approved", "received", "cancelled"] as PurchaseStatus[]).map(value => <button type="button" key={value} className={voucher.status === value ? "active" : ""} disabled={busy === voucher.id || voucher.status === value} onClick={() => changeStatus(voucher, value)}>{purchaseStatusLabels[value]}</button>)}</div><div className="purchase-card-actions"><button type="button" onClick={() => setInvoicePreview(voucher)}>فاکتور داخلی</button>{voucher.invoiceFile && <a href={`${API_URL}${voucher.invoiceFile}`} target="_blank" rel="noreferrer">فاکتور پیوست</a>}<button type="button" onClick={() => setEditor(voucher)}><Icon name="edit" size={15} /> ویرایش</button><button type="button" className="danger" onClick={() => setDeleteTarget(voucher)}><Icon name="trash" size={15} /> حذف</button></div></footer></article>)}{!visible.length && <div className="admin-empty">حواله‌ای مطابق فیلترهای انتخاب‌شده وجود ندارد.</div>}</div></section>{editor && <PurchaseVoucherEditor voucher={editor === "new" ? null : editor} products={products} onClose={() => setEditor(null)} onSaved={async () => { setEditor(null); await onChanged(); }} />}{invoicePreview && <PurchaseInvoice voucher={invoicePreview} onClose={() => setInvoicePreview(null)} />}{deleteTarget && <div className="admin-delete-backdrop" onClick={() => busy === null && setDeleteTarget(null)}><section className="admin-delete-dialog" role="alertdialog" aria-modal="true" onClick={event => event.stopPropagation()}><div className="admin-delete-icon"><Icon name="trash" size={23} /></div><small>اصلاح موجودی به‌صورت خودکار</small><h2>حذف حواله خرید #{deleteTarget.id}</h2><p>حواله حذف می‌شود و اگر دریافت شده باشد، موجودی کالاهای آن نیز به مقدار قبل برمی‌گردد.</p><div><button onClick={() => setDeleteTarget(null)} disabled={busy !== null}>انصراف</button><button className="danger" onClick={remove} disabled={busy !== null}>{busy === deleteTarget.id ? "در حال حذف..." : "حذف حواله"}</button></div></section></div>}</>;
}

function PurchaseInvoice({ voucher, onClose }: { voucher: PurchaseVoucher; onClose: () => void }) {
  const printInvoice = () => {
    const previousTitle = document.title;
    const invoiceNumber = String(voucher.invoiceNo || voucher.id).replace(/[\\/:*?"<>|]/g, "-");
    document.title = `factor_${invoiceNumber}`;
    const restoreTitle = () => { document.title = previousTitle; };
    window.addEventListener("afterprint", restoreTitle, { once: true });
    window.print();
  };
  return <div className="purchase-invoice-backdrop" onClick={onClose}><section className="purchase-invoice" dir="rtl" onClick={event => event.stopPropagation()}><div className="purchase-invoice-tools"><button type="button" onClick={onClose}>بستن</button><button type="button" className="print" onClick={printInvoice}>چاپ / ذخیره PDF</button></div><header><img src="/images/header/logo.png" alt="مادر مارکت" /><div><h1>فاکتور خرید کالا</h1><p>سند داخلی خرید و ورود کالا</p></div><span className={`purchase-status ${voucher.status}`}>{purchaseStatusLabels[voucher.status]}</span></header><div className="purchase-invoice-info"><div><small>شماره حواله</small><b>#{voucher.id}</b></div><div><small>شماره فاکتور</small><b>{voucher.invoiceNo || "—"}</b></div><div><small>تاریخ خرید</small><b>{new Date(voucher.voucherDate).toLocaleDateString("fa-IR")}</b></div><div><small>تأمین‌کننده</small><b>{voucher.supplierName}</b></div></div><table><thead><tr><th>ردیف</th><th>شرح کالا</th><th>تعداد</th><th>قیمت واحد</th><th>مبلغ کل</th></tr></thead><tbody>{voucher.items.map((item, index) => <tr key={item.id}><td>{money(index + 1)}</td><td>{item.product.title}</td><td>{money(item.quantity)}</td><td>{money(item.unitCost)} تومان</td><td>{money(item.quantity * item.unitCost)} تومان</td></tr>)}</tbody></table><div className="purchase-invoice-summary"><span>جمع کل فاکتور</span><b>{money(voucher.totalCost)} <small>تومان</small></b></div>{voucher.notes && <p className="purchase-invoice-note"><b>توضیحات:</b> {voucher.notes}</p>}<div className="purchase-invoice-signatures"><div>مهر و امضای تأمین‌کننده</div><div>تأیید مسئول خرید</div><div>تأیید انباردار</div></div><footer>این فاکتور به‌صورت خودکار توسط سامانه مادر مارکت تولید شده است.</footer></section></div>;
}

function PurchaseProductSelect({ products, value, onChange }: { products: Product[]; value: number; onChange: (id: number) => void }) {
  const [open, setOpen] = useState(false); const selected = products.find(product => product.id === value);
  return <div className={`purchase-product-select ${open ? "open" : ""}`}><button type="button" onClick={() => setOpen(current => !current)}><span>{selected?.title ?? "انتخاب کالا"}<small>موجودی {money(selected?.stock ?? 0)}</small></span><img src="/images/basket/arrow-down.png" alt="" /></button>{open && <div className="purchase-product-menu">{products.map(product => <button type="button" key={product.id} className={product.id === value ? "active" : ""} onClick={() => { onChange(product.id); setOpen(false); }}><img src={product.image} alt="" /><span><b>{product.title}</b><small>موجودی {money(product.stock)} عدد</small></span>{product.id === value && <i>✓</i>}</button>)}</div>}</div>;
}

function AdminCategorySelect({ categories, value, onChange }: { categories: Category[]; value: number; onChange: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find(category => category.id === value);
  return <div className={`purchase-product-select admin-category-select ${open ? "open" : ""}`}><button type="button" onClick={() => setOpen(current => !current)}><span>{selected?.title ?? "انتخاب دسته‌بندی"}<small>{selected ? `${money(selected._count?.products ?? 0)} محصول` : "یک دسته را انتخاب کنید"}</small></span><img src="/images/basket/arrow-down.png" alt="" /></button>{open && <div className="purchase-product-menu">{categories.map(category => <button type="button" key={category.id} className={category.id === value ? "active" : ""} onClick={() => { onChange(category.id); setOpen(false); }}><img src={category.image} alt="" /><span><b>{category.title}</b><small>{money(category._count?.products ?? 0)} محصول</small></span>{category.id === value && <i>✓</i>}</button>)}</div>}</div>;
}

function PurchaseNumberInput({ value, min, max, step, onChange, moneyValue = false }: { value: number; min: number; max?: number; step: number; onChange: (value: number) => void; moneyValue?: boolean }) {
  const clamp = (next: number) => Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, next));
  return <div className="purchase-number-input" dir="ltr"><button type="button" onClick={() => onChange(clamp(value - step))}>−</button><input inputMode="numeric" value={moneyValue ? value.toLocaleString("en-US") : value} onChange={event => { const next = Number(event.target.value.replace(/[^0-9]/g, "")); onChange(clamp(next || 0)); }} /><button type="button" onClick={() => onChange(clamp(value + step))}>＋</button></div>;
}

function PurchaseVoucherEditor({ voucher, products, initialProductId, onClose, onSaved }: { voucher: PurchaseVoucher | null; products: Product[]; initialProductId?: number; onClose: () => void; onSaved: () => Promise<void> }) {
  const today = new Date().toISOString().slice(0, 10);
  const [supplierName, setSupplierName] = useState(voucher?.supplierName ?? "");
  const [invoiceNo, setInvoiceNo] = useState(voucher?.invoiceNo ?? "");
  const [notes, setNotes] = useState(voucher?.notes ?? "");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [voucherDate, setVoucherDate] = useState(voucher ? new Date(voucher.voucherDate).toISOString().slice(0, 10) : today);
  const [rows, setRows] = useState<Array<{ productId: number; quantity: number; unitCost: number }>>(voucher?.items.map(item => ({ productId: item.productId, quantity: item.quantity, unitCost: item.unitCost })) ?? [{ productId: initialProductId ?? products[0]?.id ?? 0, quantity: 1, unitCost: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const total = rows.reduce((sum, row) => sum + row.quantity * row.unitCost, 0);
  const updateRow = (index: number, patch: Partial<(typeof rows)[number]>) => setRows(current => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!supplierName.trim() || rows.some(row => !row.productId || row.quantity < 1 || row.unitCost < 0)) { setError("اطلاعات تأمین‌کننده و ردیف‌های کالا را کامل کنید."); return; } setSaving(true); setError(""); try { let invoiceFilePath = voucher?.invoiceFile ?? ""; if (invoiceFile) { const form = new FormData(); form.append("file", invoiceFile); const upload = await fetch(`${API_URL}/admin/invoice-files`, { method: "POST", body: form }); if (!upload.ok) throw new Error("UPLOAD_FAILED"); invoiceFilePath = (await upload.json() as { path: string }).path; } const response = await fetch(`${API_URL}/admin/purchase-vouchers${voucher ? `/${voucher.id}` : ""}`, { method: voucher ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supplierName: supplierName.trim(), invoiceNo: invoiceNo.trim(), invoiceFile: invoiceFilePath, notes: notes.trim(), voucherDate, items: rows }) }); if (!response.ok) throw new Error(); await onSaved(); } catch { setError("ذخیره حواله یا بارگذاری فاکتور انجام نشد. فایل باید تصویر یا PDF و حداکثر ۸ مگابایت باشد."); } finally { setSaving(false); } };
  return <div className="admin-modal-backdrop purchase-editor-backdrop" onClick={onClose}><section className="purchase-editor" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}><header><div><small>{voucher ? `ویرایش حواله #${voucher.id}` : "ثبت خرید جدید"}</small><h2>{voucher ? "ویرایش حواله خرید" : "حواله خرید کالا"}</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></header><form onSubmit={submit}><div className="purchase-form-grid"><label><span>نام تأمین‌کننده</span><input value={supplierName} onChange={event => setSupplierName(event.target.value)} placeholder="مثلاً شرکت پخش نمونه" /></label><label><span>شماره فاکتور</span><input value={invoiceNo} onChange={event => setInvoiceNo(event.target.value)} placeholder="اختیاری" /></label><label><span>تاریخ حواله</span><input type="date" value={voucherDate} onChange={event => setVoucherDate(event.target.value)} /></label></div><label className="purchase-invoice-upload"><span>فاکتور اصلی تأمین‌کننده</span><div><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={event => setInvoiceFile(event.target.files?.[0] ?? null)} /><b>{invoiceFile ? invoiceFile.name : voucher?.invoiceFile ? "فاکتور قبلی پیوست شده است" : "انتخاب تصویر یا PDF"}</b><small>حداکثر ۸ مگابایت</small></div></label><div className="purchase-editor-items"><div className="purchase-editor-items-head"><div><h3>اقلام حواله</h3><p>محصول، تعداد و قیمت خرید را وارد کنید.</p></div><button type="button" onClick={() => setRows(current => [...current, { productId: products[0]?.id ?? 0, quantity: 1, unitCost: 0 }])}><Icon name="plus" size={14} /> افزودن ردیف</button></div>{rows.map((row, index) => <div className="purchase-editor-row" key={index}><label><span>کالا</span><PurchaseProductSelect products={products} value={row.productId} onChange={productId => updateRow(index, { productId })} /></label><label><span>تعداد</span><PurchaseNumberInput value={row.quantity} min={1} step={1} onChange={quantity => updateRow(index, { quantity })} /></label><label><span>قیمت خرید واحد</span><PurchaseNumberInput value={row.unitCost} min={0} step={10000} moneyValue onChange={unitCost => updateRow(index, { unitCost })} /></label><b>{money(row.quantity * row.unitCost)} تومان</b><button type="button" disabled={rows.length === 1} onClick={() => setRows(current => current.filter((_, rowIndex) => rowIndex !== index))}><Icon name="trash" size={15} /></button></div>)}</div><label className="purchase-notes-field"><span>یادداشت</span><textarea rows={2} value={notes} onChange={event => setNotes(event.target.value)} placeholder="توضیحات اختیاری حواله" /></label>{error && <p className="form-error">{error}</p>}<div className="purchase-editor-total"><span>مبلغ کل حواله</span><b>{money(total)} <small>تومان</small></b></div><footer><button type="button" onClick={onClose}>انصراف</button><button className="admin-primary" disabled={saving}>{saving ? "در حال ذخیره..." : "ذخیره حواله"}</button></footer></form></section></div>;
}

function OrdersAdmin({ items, onChanged }: { items: AdminOrder[]; onChanged: () => Promise<void> }) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);
  const [userFilter, setUserFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const filteredOrders = useMemo(() => {
    const query = userFilter.trim().toLocaleLowerCase("fa");
    return items.filter(order => {
      const fullName = `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim().toLocaleLowerCase("fa");
      const date = new Date(order.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return (!query || order.user.phone.includes(query) || fullName.includes(query) || String(order.user.id) === query) && (!dateFilter || dateKey === dateFilter);
    });
  }, [items, userFilter, dateFilter]);
  const updateStatus = async (id: number, status: AdminOrder["status"]) => {
    setBusyId(id);
    try {
      const response = await fetch(`${API_URL}/admin/orders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error();
      await onChanged();
    } catch { alert("تغییر وضعیت سفارش انجام نشد."); }
    finally { setBusyId(null); }
  };
  const removeOrder = async (order: AdminOrder) => {
    setBusyId(order.id);
    try {
      const response = await fetch(`${API_URL}/admin/orders/${order.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      await onChanged();
      setDeleteTarget(null);
    } catch { alert("حذف سفارش انجام نشد."); }
    finally { setBusyId(null); }
  };
  return <><section className="admin-panel admin-page-panel">
    <div className="admin-toolbar admin-orders-toolbar"><div><h3>مدیریت سفارشات کاربران</h3><p>{userFilter || dateFilter ? `${money(filteredOrders.length)} سفارش از ${money(items.length)} سفارش` : `${money(items.length)} سفارش ثبت‌شده`}</p></div><div className="admin-order-filters"><label><Icon name="search" size={15} /><input value={userFilter} onChange={event => setUserFilter(event.target.value)} placeholder="نام یا شماره موبایل کاربر" /></label><label className="admin-order-date"><span>تاریخ</span><input type="date" value={dateFilter} onChange={event => setDateFilter(event.target.value)} /></label><button type="button" className={!userFilter && !dateFilter ? "active" : ""} onClick={() => { setUserFilter(""); setDateFilter(""); }}>همه سفارشات</button></div></div>
    <div className="admin-orders-list">
      {filteredOrders.map(order => <article className="admin-order-card" key={order.id}>
        <header><div><b>سفارش #{order.id}</b><small>{new Date(order.createdAt).toLocaleString("fa-IR")}</small></div><div className="admin-order-user"><span className="admin-order-user-avatar"><UserAvatarIcon /></span><div><b>{order.user.firstName || order.user.lastName ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() : `کاربر #${order.user.id}`}</b><small dir="ltr">{order.user.phone}</small></div></div></header>
        <div className="admin-order-products">{order.items.map(item => <div key={item.id}><img src={item.image} alt="" /><p><b>{item.title}</b><small>{money(item.quantity)} عدد × {money(item.price)} تومان</small></p></div>)}</div>
        <div className="admin-order-meta"><span><small>آدرس تحویل</small>{order.address}</span><span><small>روش پرداخت</small>{order.paymentMethod}</span><span><small>مبلغ کل</small><b>{money(order.totalPrice)} تومان</b></span></div>
        <footer><div className="admin-order-status-control"><span>وضعیت سفارش</span><OrderStatusSelect value={order.status} disabled={busyId === order.id} onChange={status => updateStatus(order.id, status)} /></div><button className="admin-order-delete" disabled={busyId === order.id} onClick={() => setDeleteTarget(order)}><Icon name="trash" size={16} /> حذف سفارش</button></footer>
      </article>)}
      {!filteredOrders.length && <div className="admin-empty">{items.length ? "سفارشی مطابق فیلترهای انتخاب‌شده پیدا نشد." : "هنوز سفارشی ثبت نشده است."}</div>}
    </div>
  </section>{deleteTarget && <div className="admin-delete-backdrop" role="presentation" onClick={() => busyId === null && setDeleteTarget(null)}><section className="admin-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-order-title" onClick={event => event.stopPropagation()}><div className="admin-delete-icon"><Icon name="trash" size={23} /></div><small>عملیات غیرقابل بازگشت</small><h2 id="delete-order-title">حذف سفارش #{deleteTarget.id}</h2><p>این سفارش و تمام اقلام آن برای همیشه حذف می‌شود. آیا از انجام این کار مطمئن هستید؟</p><div><button type="button" onClick={() => setDeleteTarget(null)} disabled={busyId !== null}>انصراف</button><button type="button" className="danger" onClick={() => removeOrder(deleteTarget)} disabled={busyId !== null}>{busyId === deleteTarget.id ? "در حال حذف..." : "حذف سفارش"}</button></div></section></div>}</>;
}

function Users({ items }: { items: User[] }) {
  return (
    <section className="admin-panel admin-page-panel">
      <div className="admin-toolbar">
        <div>
          <h3>کاربران ثبت‌نام‌شده</h3>
          <p>{money(items.length)} حساب کاربری</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>کاربر</th>
              <th>شماره موبایل</th>
              <th>تاریخ عضویت</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <span className="user-table-avatar"><UserAvatarIcon /></span>{u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : `کاربر #${u.id}`}
                  </div>
                </td>
                <td className="admin-user-phone"><bdi dir="ltr">{u.phone}</bdi></td>
                <td>{new Date(u.createdAt).toLocaleDateString("fa-IR")}</td>
                <td>
                  <span className={u.isActive ? "status-active" : "status-inactive"}>{u.isActive ? "فعال" : "غیرفعال"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="admin-empty">هنوز کاربری ثبت‌نام نکرده است.</div>
        )}
      </div>
    </section>
  );
}

function Editor({
  modal,
  categories,
  onClose,
  onSaved,
}: {
  modal: { kind: "product" | "category" | "banner" | "slider"; item?: any };
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const item = modal.item;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState<number>(item?.price ?? 0);
  const [discount, setDiscount] = useState<number>(item?.discount ?? 0);
  const [categoryId, setCategoryId] = useState<number>(item?.categoryId ?? categories[0]?.id ?? 0);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    let body: any = { image: String(form.get("image")) };
    if (modal.kind === "product")
      body = {
        ...body,
        title: String(form.get("title")),
        price: Number(form.get("price")),
        discount: Number(form.get("discount")),
        categoryId: Number(form.get("categoryId")),
      };
    else if (modal.kind === "category") body.title = String(form.get("title"));
    else body.link = String(form.get("link"));
    try {
      const endpoint = `${API_URL}/admin/${modal.kind}s${item ? `/${item.id}` : ""}`;
      const r = await fetch(endpoint, {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      onSaved();
    } catch {
      setMessage("ذخیره انجام نشد؛ اطلاعات واردشده را بررسی کنید.");
      setBusy(false);
    }
  };
  const label =
    modal.kind === "product"
      ? "محصول"
      : modal.kind === "category"
        ? "دسته‌بندی"
        : modal.kind === "banner"
          ? "بنر"
          : "اسلایدر";
  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="admin-modal" onSubmit={submit}>
        <div className="admin-modal-head">
          <div>
            <small>{item ? "ویرایش اطلاعات" : "ایجاد مورد جدید"}</small>
            <h2>{item ? `ویرایش ${label}` : `افزودن ${label}`}</h2>
          </div>
          <button type="button" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="admin-form">
          {(modal.kind === "product" || modal.kind === "category") && (
            <label>
              <span>عنوان {label}</span>
              <input
                name="title"
                defaultValue={item?.title}
                minLength={2}
                required
                placeholder={`نام ${label} را وارد کنید`}
              />
            </label>
          )}
          <label>
            <span>آدرس تصویر</span>
            <input
              name="image"
              defaultValue={item?.image}
              required
              placeholder="/images/... یا https://..."
              dir="ltr"
            />
          </label>
          {modal.kind === "product" && (
            <>
              <div className="form-row">
                <label>
                  <span>قیمت (تومان)</span>
                  <input type="hidden" name="price" value={price} />
                  <PurchaseNumberInput value={price} min={0} step={500} moneyValue onChange={setPrice} />
                </label>
                <label>
                  <span>درصد تخفیف</span>
                  <input type="hidden" name="discount" value={discount} />
                  <PurchaseNumberInput value={discount} min={0} max={100} step={1} onChange={setDiscount} />
                </label>
              </div>
              <label>
                <span>دسته‌بندی</span>
                <input type="hidden" name="categoryId" value={categoryId} />
                <AdminCategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
              </label>
            </>
          )}
          {(modal.kind === "banner" || modal.kind === "slider") && (
            <label>
              <span>لینک مقصد</span>
              <input
                name="link"
                defaultValue={item?.link}
                placeholder="/products یا https://..."
                dir="ltr"
              />
            </label>
          )}
          {message && <p className="form-error">{message}</p>}
        </div>
        <div className="admin-modal-actions">
          <button type="button" onClick={onClose}>
            انصراف
          </button>
          <button className="admin-primary" disabled={busy}>
            {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
