/**
 * Authentication Buttons Component
 *
 * Displays user avatar and dropdown menu with:
 * - User profile information
 * - Token/credit balance
 * - Remaining model slots
 * - Navigation links (dashboard, pricing, profile)
 * - Logout functionality
 *
 * Features:
 * - Role-based navigation (admin vs user routes)
 * - Real-time user data fetching
 * - Internationalization support
 * - Loading state with skeleton
 * - Avatar with fallback initials
 *
 * @param userId - Current user's ID
 * @param userImage - User's profile image URL
 * @param userTokens - User's current token balance
 * @param userModels - Number of model slots remaining
 * @param closeSheet - Optional callback to close mobile menu
 */
"use client";
import React from "react";
import Link from "next/link";
import { Bot, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetUserById } from "@/app/auth/_services/useGetUserById";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

function AuthButtons({
  userId,
  userImage,
  userTokens,
  userModels,
  closeSheet,
}: {
  userId: string;
  userImage: string;
  userModels: number;
  userTokens: number;
  closeSheet?: () => void;
}) {
  const { t } = useTranslation();
  const { userByIdData, userByIdDataLoading } = useGetUserById(userId);

  // Show loading skeleton while fetching user data
  if (userByIdDataLoading) {
    return (
      <div className="p-0 rounded-full h-10 w-10 bg-gray-200 animate-pulse"></div>
    );
  }

  if (!userByIdData) {
    return null;
  }

  // Generate avatar fallback from first letter of name or email
  const avatarFallbackText = (userByIdData.name ||
    userByIdData.email ||
    "U")[0]?.toUpperCase();

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 rounded-full hover:bg-gray-100"
          >
            {/* Avatar button with name (desktop only) */}
            <div className="flex items-center justify-center md:gap-2 md:pr-7 bg-black/80 rounded-full text-white md:p-1">
              <Avatar className="h-8 w-8 border-2 border-white ">
                {userImage && (
                  <AvatarImage className="object-cover" src={userImage} />
                )}
                <AvatarFallback className="bg-gray-500 text-white font-medium">
                  {avatarFallbackText}
                </AvatarFallback>
              </Avatar>
              <h1 className="hidden md:block">{userByIdData.name}</h1>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-lg shadow-xl"
          align="end"
        >
          <DropdownMenuLabel className="p-4">
            {/* User Info */}
            <div className="text-lg font-semibold text-gray-900">
              {userByIdData.name || userByIdData.email}{" "}
            </div>
            <div className="text-sm text-gray-500 font-normal mt-1">
              {userByIdData.email}
            </div>

            {/* Token/Credits Display */}
            <div className="mt-2 flex items-center gap-1.5">
              <Coins className="text-amber-500" size={16} />
              <span
                className="text-sm font-medium ml-1 text-gray-700"
                suppressHydrationWarning
              >
                {t("navbar.authButtons.credits")}
              </span>
              <span className="text-sm font-bold text-amber-600">
                {userTokens}
              </span>
            </div>

            {/* Model Slots Display */}
            <div className="mt-2 flex items-center gap-1.5">
              <Bot className="text-blue-500" size={16} />
              <span
                className="text-sm font-medium ml-1 text-gray-700"
                suppressHydrationWarning
              >
                {t("navbar.authButtons.remainingModels")}
              </span>
              <span className="text-sm font-bold text-blue-600">
                {userModels ?? 0}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-200" />

          {/* Dashboard Link - Role-based routing */}
          <DropdownMenuItem
            onClick={closeSheet}
            asChild
            className="hover:bg-gray-100"
          >
            <Link
              href={`/${userByIdData.role === "admin" ? "admin" : "user"}/dashboard`}
            >
              <span suppressHydrationWarning>
                {t("navbar.authButtons.dashboard")}
              </span>
            </Link>
          </DropdownMenuItem>

          {/* Pricing/Manage Pricing Link - Role-based */}
          <DropdownMenuItem
            onClick={closeSheet}
            asChild
            className="hover:bg-gray-100"
          >
            <Link
              href={
                userByIdData.role === "admin"
                  ? "/admin/manage-pricing"
                  : "/user/subscription"
              }
            >
              <span suppressHydrationWarning>
                {userByIdData.role === "admin"
                  ? t("navbar.authButtons.managePricing")
                  : t("navbar.authButtons.pricing")}
              </span>
            </Link>
          </DropdownMenuItem>

          {/* Profile Link - Role-based routing */}
          <DropdownMenuItem
            onClick={closeSheet}
            asChild
            className="hover:bg-gray-100"
          >
            <Link
              href={
                userByIdData.role === "admin"
                  ? "/admin/profile"
                  : "/user/profile"
              }
            >
              <span suppressHydrationWarning>
                {t("navbar.authButtons.profile")}
              </span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-200" />

          {/* Logout Button */}
          <DropdownMenuItem
            className="text-rose-500 hover:bg-gray-100 cursor-pointer"
            onClick={async () => {
              await signOut({ redirectTo: "/auth/sign-in" });
              if (closeSheet) {
                closeSheet();
              }
            }}
          >
            <span suppressHydrationWarning>
              {t("navbar.authButtons.logout")}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default AuthButtons;
