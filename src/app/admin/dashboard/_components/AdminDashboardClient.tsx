"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Coins,
  Database,
  DollarSign,
  Image,
  Mail,
  User,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type DashboardData = {
  totalUsers: number;
  tokensDistributed: string | number;
  receivedAmount: string | number;
  allSubModelsCount: number;
  pendingSubModelsCount: number;
  trainedSubModelsCount: number;
  photosGenerated: string | number;
  videosGenerated: string | number;
};

type Props = {
  currentUser: any; // Ideally typed strongly
  data: DashboardData;
};

export default function AdminDashboardClient({ currentUser, data }: Props) {
  const { t } = useTranslation();

  const platformStats = [
    {
      label: t("admin.dashboard.platformOverview.totalUsers.label"),
      value: data.totalUsers,
      description: t("admin.dashboard.platformOverview.totalUsers.desc"),
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      trend: "+12%",
    },
    {
      label: t("admin.dashboard.platformOverview.totalTokens.label"),
      value: data.tokensDistributed,
      description: t("admin.dashboard.platformOverview.totalTokens.desc"),
      icon: Zap,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      borderColor: "border-amber-200 dark:border-amber-800",
      trend: "+8%",
    },
    {
      label: t("admin.dashboard.platformOverview.revenue.label"),
      value: `$${data.receivedAmount}`,
      description: t("admin.dashboard.platformOverview.revenue.desc"),
      icon: DollarSign,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      trend: "+23%",
    },
  ];

  const modelStats = [
    {
      label: t("admin.dashboard.subModelStats.total.label"),
      value: data.allSubModelsCount,
      description: t("admin.dashboard.subModelStats.total.desc"),
      icon: Database,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      label: t("admin.dashboard.subModelStats.pending.label"),
      value: data.pendingSubModelsCount,
      description: t("admin.dashboard.subModelStats.pending.desc"),
      icon: Clock,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      label: t("admin.dashboard.subModelStats.trained.label"),
      value: data.trainedSubModelsCount,
      description: t("admin.dashboard.subModelStats.trained.desc"),
      icon: CheckCircle2,
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-950",
      borderColor: "border-teal-200 dark:border-teal-800",
    },
  ];

  const generationStats = [
    {
      label: t("admin.dashboard.generationActivity.photos.label"),
      value: data.photosGenerated,
      description: t("admin.dashboard.generationActivity.photos.desc"),
      icon: Image,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      label: t("admin.dashboard.generationActivity.videos.label"),
      value: data.videosGenerated,
      description: t("admin.dashboard.generationActivity.videos.desc"),
      icon: Video,
      iconColor: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
            {t("admin.dashboard.header.title", { name: currentUser?.name })}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.dashboard.header.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 shadow-sm">
            <Coins className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">
              {t("admin.dashboard.header.tokens", {
                count: currentUser?.tokens?.toLocaleString(),
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("admin.dashboard.platformOverview.title")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </CardTitle>
                    </div>
                    <div
                      className={`rounded-xl ${stat.bgColor} p-3 transition-all duration-300 group-hover:scale-110 border ${stat.borderColor}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Model Statistics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("admin.dashboard.subModelStats.title")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modelStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </CardTitle>
                    </div>
                    <div
                      className={`rounded-xl ${stat.bgColor} p-3 transition-all duration-300 group-hover:scale-110 border ${stat.borderColor}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Generation Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {t("admin.dashboard.generationActivity.title")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {generationStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardDescription className="text-xs font-medium uppercase tracking-wider">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </CardTitle>
                    </div>
                    <div
                      className={`rounded-xl ${stat.bgColor} p-3 transition-all duration-300 group-hover:scale-110 border ${stat.borderColor}`}
                    >
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Account Details */}
      <Card className="border-2 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {t("admin.dashboard.accountDetails.title")}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {t("admin.dashboard.accountDetails.subtitle")}
              </CardDescription>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {t("admin.dashboard.accountDetails.fullName")}
                </span>
              </div>
              <p className="text-base font-semibold">{currentUser?.name}</p>
            </div>

            <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {t("admin.dashboard.accountDetails.email")}
                </span>
              </div>
              <p className="text-base font-semibold break-all">
                {currentUser?.email}
              </p>
            </div>

            <div className="flex flex-col space-y-3 rounded-lg border bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4 shadow-sm border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Coins className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {t("admin.dashboard.accountDetails.tokenBalance")}
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-950 dark:text-amber-50">
                {currentUser?.tokens.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
