import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A]">
      <Sidebar />
      <div className="sm:pl-64">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
