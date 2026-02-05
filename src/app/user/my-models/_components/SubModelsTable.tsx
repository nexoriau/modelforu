'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarIcon,
  Play,
  Plus,
  X,
  Image as ImageIcon,
  Mic,
  Clock,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import moment from 'moment';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SubModelTableType } from '@/db/schema/sub-model';
import CommonNotFound from '@/components/shared/CommonNotFound';

type Props = {
  photoSubModels: SubModelTableType[];
  videoSubModels: SubModelTableType[];
  audioSubModels: SubModelTableType[];
};

export default function SubModelsTable({
  photoSubModels,
  videoSubModels,
  audioSubModels,
}: Props) {
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [modelTypeFilter, setModelTypeFilter] = useState('');
  const router = useRouter();
  const params = useParams();

  const filterByDate = (subModels: SubModelTableType[]) => {
    return subModels.filter((subModel) => {
      const modelDate = moment(subModel.createdAt);
      if (fromDate && modelDate.isBefore(moment(fromDate).startOf('day'))) {
        return false;
      }
      if (toDate && modelDate.isAfter(moment(toDate).endOf('day'))) {
        return false;
      }
      return true;
    });
  };

  const filteredPhoto = filterByDate(photoSubModels);
  const filteredVideo = filterByDate(videoSubModels);
  const filteredAudio = filterByDate(audioSubModels);

  const showPhoto =
    !modelTypeFilter ||
    modelTypeFilter === 'all' ||
    modelTypeFilter === 'photo';
  const showVideo =
    !modelTypeFilter ||
    modelTypeFilter === 'all' ||
    modelTypeFilter === 'video';
  const showAudio =
    !modelTypeFilter ||
    modelTypeFilter === 'all' ||
    modelTypeFilter === 'audio';

  const hasModels =
    (showPhoto && filteredPhoto.length > 0) ||
    (showVideo && filteredVideo.length > 0) ||
    (showAudio && filteredAudio.length > 0);

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setModelTypeFilter('');
  };

  const renderSubModelCard = (
    subModel: SubModelTableType,
    type: 'photo' | 'video' | 'audio'
  ) => {
    const iconConfig = {
      photo: {
        icon: ImageIcon,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      video: {
        icon: Play,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
      },
      audio: {
        icon: Mic,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
      },
    };

    const config = iconConfig[type];
    const Icon = config.icon;

    return (
      <Card
        key={subModel.id}
        className="hover:shadow-lg transition-all duration-300 hover:border-slate-300"
      >
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 capitalize">
                  {(subModel as any).model?.name}’s Model
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {subModel.itemsLength}{' '}
                  {subModel.itemsLength === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Description */}
          {subModel.description && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-sm text-slate-700 line-clamp-2">
                {subModel.description.length > 35
                  ? subModel.description.slice(0, 35) + '....'
                  : subModel.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>
                Created {moment(subModel.createdAt).format('MMM DD, YYYY')}
              </span>
            </div>
            {subModel.updatedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {moment(subModel.updatedAt).fromNow()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => router.push(`/user/my-models/${subModel.modelId}`)}
              className="flex-1"
              variant="default"
            >
              View Details
            </Button>
            {subModel.status === 'cloned' && (
              <Button
                onClick={() =>
                  router.push(
                    `/user/my-models/${subModel.modelId}/generate?subModel=${subModel.id}`
                  )
                }
                className="flex-1"
                variant="outline"
              >
                <Play className="w-4 h-4 mr-1.5" />
                Generate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sub Models</CardTitle>
        <CardDescription>
          Here you see all the sub models you have generated since you created
          Account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div>
          {/* Filters */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* From Date Picker */}
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal bg-white border-gray-300 rounded-lg',
                    !fromDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDate
                    ? moment(fromDate).format('MMM DD, YYYY')
                    : 'From Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            {/* To Date Picker */}
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal bg-white border-gray-300 rounded-lg',
                    !toDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDate ? moment(toDate).format('MMM DD, YYYY') : 'To Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  autoFocus
                />
              </PopoverContent>
            </Popover>

            <Select onValueChange={setModelTypeFilter} value={modelTypeFilter}>
              <SelectTrigger className="w-full bg-white border-gray-300 rounded-lg">
                <SelectValue placeholder="Model Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="photo">Photo Model</SelectItem>
                <SelectItem value="video">Video Model</SelectItem>
                <SelectItem value="audio">Audio Model</SelectItem>
              </SelectContent>
            </Select>

            {(fromDate || toDate || modelTypeFilter) && (
              <Button onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" /> Clear Filters
              </Button>
            )}
          </div>

          {!hasModels && <CommonNotFound collection="Sub Models" />}

          {/* Photo Model Section */}
          {showPhoto && filteredPhoto.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Photo Models
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPhoto.map((subModel) =>
                  renderSubModelCard(subModel, 'photo')
                )}
              </div>
            </div>
          )}

          {/* Video Model Section */}
          {showVideo && filteredVideo.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Video Models
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredVideo.map((subModel) =>
                  renderSubModelCard(subModel, 'video')
                )}
              </div>
            </div>
          )}

          {/* Audio Model Section */}
          {showAudio && filteredAudio.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Audio Models
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredAudio.map((subModel) =>
                  renderSubModelCard(subModel, 'audio')
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
