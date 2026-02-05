"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  DollarSign,
  Users,
  History,
  Activity,
  User,
  ListChecks,
  Cpu,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Models Management",
      href: "/admin/trained-models",
      icon: Cpu,
    },
    { name: "Users Management", href: "/admin/users", icon: Users },
    { name: "Manage Pricing", href: "/admin/manage-pricing", icon: DollarSign },
    {
      name: "Sub Models Requests",
      href: "/admin/sub-models-requests",
      icon: ListChecks,
    },
    {
      name: "Transaction History",
      href: "/admin/transaction-history",
      icon: History,
    },
    {
      name: "Recent Activities",
      href: "/admin/recent-activities",
      icon: Activity,
    },

    // { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-2 p-4 md:p-0">
      {navItems.map(({ name, href, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (pathname.startsWith(href) && href !== "/admin/dashboard");
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-4 py-2 rounded hover:bg-muted ${
              isActive ? "bg-muted font-semibold" : ""
            }`}
            onClick={onClick}
          >
            <Icon className="w-4 h-4 mr-2" />
            {name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden p-2 w-10">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button aria-label="Open Admin Sidebar">
              <Menu className="w-6 h-6 fixed top-[93px] left-2" />
            </button>
          </SheetTrigger>
          <SheetContent
            aria-describedby={undefined}
            side="left"
            className="w-64"
          >
            <SheetTitle className="text-xl font-bold px-4 pt-3">
              Admin Menu
            </SheetTitle>
            <NavLinks onClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 bg-white border-r min-h-screen border-t">
        <div className=" fixed top-[78px] left-0 h-fit w-64">
          <h2 className="text-2xl font-bold pb-3 mb-4 px-4 pl-[30px] border-b">
            Models For You
          </h2>
          <div className="px-4">
            <NavLinks />
          </div>
        </div>
      </aside>
    </>
  );
}
