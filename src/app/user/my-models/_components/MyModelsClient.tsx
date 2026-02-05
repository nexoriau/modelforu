"use client";

import CommonNotFound from "@/components/shared/CommonNotFound";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DefaultModelsComp from "./DefaultModelsComp";
import { useTranslation } from "react-i18next";
import { ModelTableType } from "@/db/schema/models";

interface MyModelsClientProps {
  defaultAddedModels: any[];
  defaultModlesList: ModelTableType[];
}

export default function MyModelsClient({
  defaultAddedModels,
  defaultModlesList,
}: MyModelsClientProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <Card className="border-none! border-0! shadow-none!">
        <CardHeader>
          <CardTitle className="text-2xl font-bold" suppressHydrationWarning>
            {t("user.myModels.title")}
          </CardTitle>
          <CardDescription>
            {/* You can create and manage one AI model under your account. */}
          </CardDescription>
          <CardAction>
            <Button asChild data-tour="my-models">
              <Link href={`/user/my-models`}>
                <span suppressHydrationWarning>
                  {t("user.myModels.viewAll")}
                </span>
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {![...defaultAddedModels].length ? (
            <CommonNotFound collection="Sub-Models" />
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {[...defaultAddedModels].slice(0, 4).map((model) => (
                <div
                  key={model.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="relative w-full h-40 bg-gray-100">
                    <Image
                      src={model.imageUrl || "/dummy-nature.png"}
                      alt={model.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {model.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {model.description.length > 20
                        ? model.description.slice(0, 20) + "...."
                        : model.description}
                    </p>
                    <Button
                      asChild
                      className="w-full h-9 bg-gray-900 hover:bg-gray-800 text-white text-xs rounded-md"
                    >
                      <Link href={`/user/my-models/${model.id}`}>
                        <span suppressHydrationWarning>
                          {t("user.myModels.viewDetails")}
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <DefaultModelsComp
        initialModels={defaultModlesList.slice(0, 4)}
        removeBorder={true}
      />
    </div>
  );
}
