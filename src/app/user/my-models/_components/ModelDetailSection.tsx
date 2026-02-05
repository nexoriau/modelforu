'use client';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Bot,
  Box,
  Calendar,
  ExternalLink,
  Hash,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import ModelActions from './ModelActions';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import { ModelTableType } from '@/db/schema/models';
import { User } from 'next-auth';
import { Badge } from '@/components/ui/badge';
import { useParams, useRouter } from 'next/navigation';

type Props = {
  modalByIdData: ModelTableType;
  user: User | undefined;
  generationCount?: number;
};

type Params = { 'sub-model-type': string };

function ModelDetailSection({ modalByIdData, generationCount, user }: Props) {
  const params = useParams() as Params;
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="relative bg-linear-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg group">
          <Image
            className="absolute object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            src={modalByIdData.imageUrl}
            alt={modalByIdData.name}
          />
          <Button
            className="absolute top-2 left-2 rounded-full cursor-pointer z-20"
            onClick={() => router.back()}
            size={'icon-sm'}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Right Column - Content */}
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {modalByIdData.name}
              </h1>
              {user &&
                !modalByIdData.isDefaultModel &&
                !modalByIdData.isPublishedByAdmin && (
                  <ModelActions model={modalByIdData} user={user as any} />
                )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {modalByIdData?.description}
            </p>
          </div>

          <Separator />

          {/* Info Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  {/* Tags Section */}
                  <div className="space-y-3 w-[70%]">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="w-4 h-4" />
                      <span>Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {modalByIdData?.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {params?.['sub-model-type'] && (
                    <div className="space-y-3 w-[30%]">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Bot className="w-4 h-4" />
                        <span>Type</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {params['sub-model-type'].toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Date Created</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {dateFormatter(modalByIdData.createdAt, 'M.D.YYYY')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hash className="w-4 h-4" />
                      <span>Gender</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {modalByIdData?.gender}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Box className="w-4 h-4" />
                      <span>Generations</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{(generationCount || generationCount === 0)  ? (generationCount || 0).toLocaleString('en-US') : "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ModelDetailSection;
