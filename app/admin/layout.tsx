import AdminChrome from "./AdminChrome";

export const metadata = {
  title: "Admin | Rolly Paredes Portfolio",
  description: "Manage selected works.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
