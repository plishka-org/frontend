import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import "./adminLayout.scss";

type AdminLayoutProps = {
  children: ReactNode;
  activeKey?: string;
};

export function AdminLayout({ children, activeKey }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <AdminSidebar activeKey={activeKey} />
      <main className="admin-layout__content">
        <div className="admin-layout__card">{children}</div>
      </main>
    </div>
  );
}