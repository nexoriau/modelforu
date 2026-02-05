"use client";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl border-none shadow-none">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* 404 Number */}
            <div className="relative">
              <h1 className="text-[150px] md:text-[200px] font-bold text-primary/10 leading-none select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground animate-pulse" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {t("notFound.title")}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md">
                {t("notFound.description")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  {t("notFound.goHome")}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
