import logo from "../../../icons/Logo.png";
import productsIcon from "../../../icons/Type=Pack.png";
import categoriesIcon from "../../../icons/Type=Categories.png";
import reviewsIcon from "../../../icons/Type=Reviews.png";
import clientsIcon from "../../../icons/Type=People.png";
import ordersIcon from "../../../icons/Type=Orders.png";
import userIcon from "../../../icons/Type=User.png";
import editIcon from "../../../icons/Type=Edit.png";

type AdminNavItem = {
  href: string;
  label: string;
  key: string;
  icon: string;
};

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "products", href: "#/admin/products", label: "Вироби", icon: productsIcon },
  { key: "categories", href: "#/admin/categories", label: "Категорії", icon: categoriesIcon },
  { key: "reviews", href: "#/admin/reviews", label: "Відгуки", icon: reviewsIcon },
  { key: "clients", href: "#/admin/clients", label: "Клієнти", icon: clientsIcon },
  { key: "orders", href: "#/admin/orders", label: "Замовлення", icon: ordersIcon },
  { key: "settings", href: "#/admin/settings", label: "Особисті дані", icon: userIcon },
  { key: "more", href: "#/admin/more", label: "Додатково", icon: editIcon },
];

type AdminSidebarProps = {
  activeKey?: string;
};

export function AdminSidebar({ activeKey }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <img src={logo} alt="Plishka" className="admin-sidebar__logo" />
      </div>

      <nav className="admin-sidebar__nav" aria-label="Навігація адмінки">
        {ADMIN_NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className="admin-sidebar__link"
            data-active={item.key === activeKey}
          >
            <img src={item.icon} alt="" className="admin-sidebar__icon" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}