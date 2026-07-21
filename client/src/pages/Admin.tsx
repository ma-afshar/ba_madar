import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import "./AdminMobile.css";
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
  categoryId: number;
  category: Category;
};
type Media = { id: number; image: string; link: string };
type User = { id: number; phone: string; firstName: string | null; lastName: string | null; createdAt: string; isActive: boolean };
type AdminOrder = { id: number; status: "active" | "delivered" | "cancelled"; totalPrice: number; deliveryFee: number; paymentMethod: string; address: string; createdAt: string; user: { id: number; phone: string; firstName: string | null; lastName: string | null }; items: Array<{ id: number; productId: number; title: string; image: string; price: number; discount: number; quantity: number }> };
type Overview = {
  products: Product[];
  categories: Category[];
  users: User[];
  banners: Media[];
  sliders: Media[];
  orders: AdminOrder[];
};
type Tab = "dashboard" | "products" | "categories" | "content" | "users" | "orders";

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
  categories: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  content: "M4 5h16v14H4V5Zm0 10 4-4 3 3 3-4 6 6M8 9h.01",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  orders: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6M9 16h4",
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
  categories: "دسته‌بندی‌ها",
  content: "بنر و اسلایدر",
  users: "کاربران",
  orders: "سفارشات",
};

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
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API_URL}/admin/overview`);
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
  const remove = async (kind: string, id: number, title: string) => {
    if (!confirm(`«${title}» حذف شود؟`)) return;
    try {
      const r = await fetch(`${API_URL}/admin/${kind}/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error();
      await load();
    } catch {
      alert(
        kind === "categories"
          ? "دسته‌ای که محصول دارد قابل حذف نیست."
          : "حذف انجام نشد.",
      );
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
          {(
            ["dashboard", "products", "categories", "orders", "content", "users"] as Tab[]
          ).map((name) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => changeTab(name)}
            >
              <Icon name={name} />
              <span>{tabTitles[name]}</span>
              {name === "products" && <b>{data?.products.length ?? 0}</b>}
              {name === "orders" && <b>{data?.orders.length ?? 0}</b>}
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
              className="admin-icon-button"
              onClick={load}
              title="به‌روزرسانی"
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
                    onRemove={(p) => remove("products", p.id, p.title)}
                  />
                )}
                {tab === "categories" && (
                  <Categories
                    items={data.categories}
                    onAdd={() => setModal({ kind: "category" })}
                    onEdit={(c) => setModal({ kind: "category", item: c })}
                    onRemove={(c) => remove("categories", c.id, c.title)}
                  />
                )}
                {tab === "content" && (
                  <Content
                    data={data}
                    onAdd={(kind) => setModal({ kind })}
                    onEdit={(kind, item) => setModal({ kind, item })}
                    onRemove={(kind, item) =>
                      remove(
                        `${kind}s`,
                        item.id,
                        kind === "banner" ? "بنر" : "اسلایدر",
                      )
                    }
                  />
                )}
                {tab === "users" && <Users items={data.users} />}
                {tab === "orders" && <OrdersAdmin items={data.orders} onChanged={load} />}
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
          <PanelHead title="نمای کلی دسته‌ها" />
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
        <header><div><b>سفارش #{order.id}</b><small>{new Date(order.createdAt).toLocaleString("fa-IR")}</small></div><div className="admin-order-user"><span>{order.user.phone.slice(-2)}</span><div><b>{order.user.firstName || order.user.lastName ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() : `کاربر #${order.user.id}`}</b><small dir="ltr">{order.user.phone}</small></div></div></header>
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
                  <input
                    name="price"
                    type="number"
                    defaultValue={item?.price ?? 0}
                    min={0}
                    required
                  />
                </label>
                <label>
                  <span>درصد تخفیف</span>
                  <input
                    name="discount"
                    type="number"
                    defaultValue={item?.discount ?? 0}
                    min={0}
                    max={100}
                    required
                  />
                </label>
              </div>
              <label>
                <span>دسته‌بندی</span>
                <select
                  name="categoryId"
                  defaultValue={item?.categoryId ?? categories[0]?.id}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
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
