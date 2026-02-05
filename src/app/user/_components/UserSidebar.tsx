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
  CreditCard,
  User,
  History,
  Bot,
  Sparkles,
  ImageIcon,
  Boxes,
  FolderKanban,
  RecycleIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function UserSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    {
      name: t("user.sidebar.dashboard"),
      href: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("user.sidebar.generate"),
      href: "/user/generate",
      icon: Sparkles,
    },
    { name: t("user.sidebar.models"), href: "/user/models", icon: Boxes },
    {
      name: t("user.sidebar.myModels"),
      href: "/user/my-models",
      icon: FolderKanban,
    },
    {
      name: t("user.sidebar.subscription"),
      href: "/user/subscription",
      icon: CreditCard,
    },
    {
      name: t("user.sidebar.transactionHistory"),
      href: "/user/transaction-history",
      icon: History,
    },
    {
      name: t("user.sidebar.gallery"),
      href: "/user/latest-generations",
      icon: ImageIcon,
    },
    {
      name: t("user.sidebar.trashBin"),
      href: "/user/trash",
      icon: RecycleIcon,
    },
  ];

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-2 p-4 md:p-0">
      {navItems.map(({ name, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center px-4 py-2 rounded hover:bg-muted ${
            pathname === href ||
            (pathname.startsWith(href) && href !== "/user/dashboard")
              ? "bg-muted font-semibold"
              : ""
          }`}
          onClick={onClick}
        >
          <Icon className="w-4 h-4 mr-2" />
          {name}
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden p-2 w-10">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button aria-label="Open User Sidebar">
              <Menu className="w-6 h-6 fixed top-[93px] left-2" />
            </button>
          </SheetTrigger>
          <SheetContent
            aria-describedby={undefined}
            side="left"
            className="w-64"
          >
            <SheetTitle className="text-xl font-bold px-4 pt-3">
              {t("user.sidebar.mobileMenuTitle")}
            </SheetTitle>
            <NavLinks onClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 bg-white border-r min-h-screen border-t">
        <div className=" fixed top-[78px] left-0 h-fit w-64">
          <h2 className="text-2xl font-bold pb-3 mb-4 px-4 pl-[30px] border-b">
            {t("user.sidebar.header")}
          </h2>
          <div className="px-4">
            <NavLinks />
          </div>
        </div>
      </aside>
    </>
  );
}
