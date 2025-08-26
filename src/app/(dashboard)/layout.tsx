import AdminLayout from "@/components/AdminLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="hold-transition sidebar-mini layout-fixed">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
