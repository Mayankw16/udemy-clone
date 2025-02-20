import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="h-20 md:pl-56 fixed inset-0 z-50">
        <Navbar />
      </div>
      <div className="hidden md:block h-full w-56 fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-20 h-full">{children}</main>
    </div>
  );
};

export default DashboardLayout;
