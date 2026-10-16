import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col md:h-dvh md:flex-row">
      <Sidebar />
      <main className="flex-1 pb-[env(safe-area-inset-bottom)] md:overflow-y-auto md:pb-0">{children}</main>
    </div>
  );
}
