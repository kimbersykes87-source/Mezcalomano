import type { Metadata } from "next";
import "./admin.css";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Mezcalómano admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="adm">
      <AdminNav />
      {children}
    </div>
  );
}
