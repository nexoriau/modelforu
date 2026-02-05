import { auth } from '@/app/auth/_services/auth';
import { ModelTableType } from '@/db/schema/models';
import { SubModelTableType } from '@/db/schema/sub-model';
import {
  cloneTypesFunction,
  getButtonConfig,
  getStatusConfig,
} from '@/lib/utils-functions/subModelsUtils';
import { getAllSubModelsByModelId } from '../_services/sub-model/subModel.queries';
import ModelDetailSection from './ModelDetailSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import LatestGenerations from './LatestGenerations';

type Props = {
  modalByIdData: ModelTableType;
  subModelDataByModel: SubModelTableType[];
  generationCount?: number
};

export default async function ModelDetailsComp({
  modalByIdData,
  subModelDataByModel,
  generationCount
}: Props) {
  const session = await auth();
  const user = session?.user;

  // 1. Prepare data for cloneTypesFunction
  const audioSubModel = subModelDataByModel.find((val) => val.type === 'audio');
  const videoSubModel = subModelDataByModel.find((val) => val.type === 'video');
  const photoSubModel = subModelDataByModel.find((val) => val.type === 'photo');

  // 2. Call cloneTypesFunction to generate the list for the UI
  const cloneTypes = cloneTypesFunction({
    photoSubModel,
    videoSubModel,
    audioSubModel,
  });

  const allSubModels = await getAllSubModelsByModelId(modalByIdData.id);

  return (
    <div className="w-full">
      <ModelDetailSection modalByIdData={modalByIdData} user={user} generationCount={generationCount} />
      {/* Cloning Section */}
      <div className="max-w-7xl mx-auto mt-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Clone Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cloneTypes.map((item) => {
            const Icon = item.icon;
            const statusConfig = getStatusConfig(item.status);
            const StatusIcon = statusConfig.icon;

            // 3. Call the refactored getButtonConfig with the required object structure
            const buttonConfig = getButtonConfig({
              status: item.status,
              type: item.type,
              modalByIdData,
              subModelDataByModel: subModelDataByModel, // Pass the full array for lookup
              disabled: !['idle', 'cloned'].includes(item.status),
            });

            return (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${statusConfig.iconBg}`}>
                      <Icon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-700">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="min-h-[100px] flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusIcon
                        className={`w-5 h-5 ${statusConfig.iconColor} ${statusConfig.iconClassName}`}
                      />
                      <p
                        className={`text-2xl font-bold ${statusConfig.textColor}`}
                      >
                        {statusConfig.label}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {!modalByIdData.isDefaultModel && (
                      <Button
                        variant="outline"
                        className={`
                          w-full hover:bg-slate-50 transition-colors
                          ${(item.status === 'pending' || item.status === 'idle') && 'invisible'}
                          ${item.status === 'cloning' && 'pointer-events-none opacity-50'}
                        `}
                        disabled={
                          item.status === 'pending' || item.status === 'idle'
                        }
                        asChild
                      >
                        <Link
                          href={`/user/my-models/${modalByIdData.id}/sub-model/${item.type}/${item.id}`}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload more files
                        </Link>
                      </Button>
                    )}
                    {buttonConfig.disabled ? (
                      <Button
                        disabled
                        variant={buttonConfig.variant}
                        className={`w-full ${buttonConfig.className}`}
                      >
                        {buttonConfig.content}
                      </Button>
                    ) : (
                      <Button
                        asChild={buttonConfig.asChild}
                        variant={buttonConfig.variant}
                        className={`w-full ${buttonConfig.className}`}
                      >
                        <Link href={buttonConfig.href ?? ''}>
                          {buttonConfig.content}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {user?.id && (
        <div className="mt-5">
          <LatestGenerations modelId={modalByIdData.id} userId={user.id} />
        </div>
      )}
    </div>
  );
}
