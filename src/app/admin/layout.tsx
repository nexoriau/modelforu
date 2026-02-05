import DashboardProtect from '@/lib/protect/DashboardProtect';
import AdminSidebar from './_components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProtect requiredRole={'admin'}>
      <div className="flex relative">
        <div className="md:w-64 bg-white border-r">
          <AdminSidebar />
        </div>
        <main className="flex-1 p-2.5 md:p-4 bg-slate-50 min-h-[81.5vh]">
          {children}
        </main>
      </div>
    </DashboardProtect>
  );
}
