"use client";

import Image from "next/image";
import Link from "next/link";
import AuthButtons from "./AuthButtons";
import { Button } from "../ui/button";
import PaymentDialogs from "./PaymentDialogs";
import { User } from "next-auth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import {
  CircleHelp,
  Search,
  Menu,
  Home,
  Package,
  CreditCard,
  Loader2,
} from "lucide-react";
import NotificationNavComp from "./NotificationNavComp";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react"; // Add this import
import { useAuth } from "@/context/AuthContext";

// type Props = {
//   user?: User & { tokens?: string; models?: number };
// };
function NavbarComp() {
  // console.log(user)
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false); // Add state for sheet
  const { currentUser: user, loadingCurrentUser } = useAuth();
  const userLoggedIn = pathname.includes("user") || pathname.includes("admin");

  // Function to close the sheet
  const closeSheet = () => {
    setSheetOpen(false);
  };

  return (
    <div
      className={cn(
        userLoggedIn
          ? "fixed top-0 left-0 right-0 z-50"
          : "fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8",
      )}
    >
      <nav
        className={cn(
          "bg-white/95 backdrop-blur-md border flex items-center justify-between px-2 py-2 md:px-4 md:py-3 w-full",
          userLoggedIn
            ? "rounded-none border-x-0 border-t-0"
            : "rounded-2xl shadow-sm",
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group duration-300 shrink-0"
        >
          <div className="flex items-center">
            <Image
              src="/logo-part-1.png"
              alt="Logo Part 1"
              width={120}
              height={60}
              className="object-contain h-7 sm:h-8 w-auto"
              priority
            />
            <Image
              src="/logo-part-2.png"
              alt="Logo Part 2"
              width={60}
              height={60}
              className="object-contain h-7 sm:h-8 w-7 sm:w-8 ml-1"
              priority
            />
          </div>
        </Link>

        {/* Desktop Search (logged in users) */}
        {userLoggedIn && (
          <div className="hidden md:block relative w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t("navbar.searchTasks")}
              className="pl-9 bg-muted/50 rounded-full border-0 focus-visible:ring-1"
              suppressHydrationWarning
            />
          </div>
        )}

        {/* Desktop Nav Links (logged out users) */}
        {!userLoggedIn && (
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link
              href="/"
              className="text-foreground/80 hover:text-foreground transition-colors"
              suppressHydrationWarning
            >
              {t("navbar.home")}
            </Link>
            <Link
              href="/"
              className="text-foreground/80 hover:text-foreground transition-colors"
              suppressHydrationWarning
            >
              {t("navbar.product")}
            </Link>
            <Link
              href="/subscription"
              className="text-foreground/80 hover:text-foreground transition-colors"
              suppressHydrationWarning
            >
              {t("navbar.pricing")}
            </Link>
          </div>
        )}

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center justify-center gap-4">
          <LanguageSwitcher />
          {loadingCurrentUser ? (
            <div className="flex justify-center px-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              {user ? (
                <div className="flex items-center justify-center gap-4">
                  <NotificationNavComp currentUser={user} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <CircleHelp className="size-6" />
                  </Button>
                  <AuthButtons
                    userId={user.id}
                    userImage={user.image ?? ""}
                    userTokens={Number(user?.tokens) ?? 0}
                    userModels={user?.models ?? 0}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button asChild variant={"ghost"} size="sm">
                    <Link
                      href="/auth/sign-in"
                      className="text-foreground/80 hover:text-foreground"
                      suppressHydrationWarning
                    >
                      <span suppressHydrationWarning>{t("navbar.login")}</span>
                    </Link>
                  </Button>
                  <Button asChild variant={"default"} size="sm">
                    <Link href="/auth/sign-up" suppressHydrationWarning>
                      <span suppressHydrationWarning>{t("navbar.signUp")}</span>
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Sheet */}
        <div className="flex items-center justify-center gap-2 md:hidden">
          {loadingCurrentUser ? (
            <div className="flex justify-center px-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              {user && <NotificationNavComp currentUser={user} />}
              {user && (
                <AuthButtons
                  userId={user.id}
                  userImage={user.image ?? ""}
                  userTokens={Number(user?.tokens) ?? 0}
                  userModels={user?.models ?? 0}
                  closeSheet={closeSheet} // Pass closeSheet as prop
                />
              )}
            </>
          )}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden size-6 rounded-lg"
                aria-label="Toggle menu"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md flex flex-col p-0 md:hidden"
            >
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  <span suppressHydrationWarning>{t("navbar.menu")}</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Mobile Search (logged in users) */}
                  {userLoggedIn && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder={t("navbar.searchTasks")}
                        className="pl-9 bg-muted/50 rounded-full border-0 focus-visible:ring-1"
                        suppressHydrationWarning
                      />
                    </div>
                  )}

                  {/* Mobile Nav Links (logged out users) */}
                  {!userLoggedIn && (
                    <div className="space-y-2">
                      <h3
                        className="text-sm font-medium text-muted-foreground px-2 mb-3"
                        suppressHydrationWarning
                      >
                        {t("navbar.navigation")}
                      </h3>
                      <Link
                        href="/"
                        onClick={closeSheet}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors group"
                      >
                        <Home className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium" suppressHydrationWarning>
                          {t("navbar.home")}
                        </span>
                      </Link>
                      <Link
                        href="/"
                        onClick={closeSheet}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors group"
                      >
                        <Package className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium" suppressHydrationWarning>
                          {t("navbar.product")}
                        </span>
                      </Link>
                      <Link
                        href="/subscription"
                        onClick={closeSheet}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors group"
                      >
                        <CreditCard className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                        <span className="font-medium" suppressHydrationWarning>
                          {t("navbar.pricing")}
                        </span>
                      </Link>
                    </div>
                  )}

                  {/* Language Switcher */}
                  {!user && (
                    <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/30">
                      <span
                        className="text-sm font-medium"
                        suppressHydrationWarning
                      >
                        {t("navbar.language")}
                      </span>
                      <div className="w-32">
                        <LanguageSwitcher />
                      </div>
                    </div>
                  )}

                  {/* User Section */}
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/30">
                        <span
                          className="text-sm font-medium"
                          suppressHydrationWarning
                        >
                          {t("navbar.helpCenter")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={closeSheet}
                        >
                          <CircleHelp className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4 border-t">
                      <div
                        className="text-sm text-muted-foreground mb-3 px-1"
                        suppressHydrationWarning
                      >
                        {t("navbar.account")}
                      </div>
                      <Button
                        asChild
                        variant={"outline"}
                        className="w-full justify-center h-11"
                      >
                        <Link
                          href="/auth/sign-in"
                          className="text-base"
                          onClick={closeSheet}
                          suppressHydrationWarning
                        >
                          {t("navbar.login")}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant={"default"}
                        className="w-full justify-center h-11"
                      >
                        <Link
                          href="/auth/sign-up"
                          className="text-base"
                          onClick={closeSheet}
                          suppressHydrationWarning
                        >
                          <span suppressHydrationWarning>
                            {t("navbar.signUp")}
                          </span>
                        </Link>
                      </Button>
                    </div>
                  )}
                  {user && (
                    <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-muted/30">
                      <span
                        className="text-sm font-medium"
                        suppressHydrationWarning
                      >
                        {t("navbar.language")}
                      </span>
                      <div className="w-32">
                        <LanguageSwitcher />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t bg-muted/20">
                <div
                  className="text-xs text-muted-foreground text-center"
                  suppressHydrationWarning
                >
                  {t("navbar.copyright")}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <PaymentDialogs />
    </div>
  );
}

export default NavbarComp;
