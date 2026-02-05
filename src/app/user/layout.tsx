import DashboardProtect from '@/lib/protect/DashboardProtect';
import UserSidebar from './_components/UserSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProtect requiredRole={['user', 'agency']}>
      <div className="flex relative">
        <div className="md:w-64 bg-white border-r">
          <UserSidebar />
        </div>
        <main className="flex-1 p-2.5 md:p-4 bg-slate-50 min-h-[81.5vh]">
          {children}
        </main>
      </div>
    </DashboardProtect>
  );
}
