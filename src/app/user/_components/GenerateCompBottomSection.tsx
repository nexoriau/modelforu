'use client';

import UseAudioSubModelComp from '@/app/user/my-models/_components/UseAudioSubModelComp';
import CommonNotFound from '@/components/shared/CommonNotFound';
import { ModelTableType } from '@/db/schema/models';
import { BotOff, Loader2 } from 'lucide-react';
import UsePhotoSubModelComp from '../my-models/_components/UsePhotoSubModelComp';
import UseVideoSubModelComp from '../my-models/_components/UseVideoSubModelComp';
import { useGetSubModelsByModelId } from '../my-models/_services/sub-model/use-queries';

type Props = {
  selectedModelData: ModelTableType;
  activeTab: 'photo' | 'video' | 'audio';
};

function GenerateCompBottomSection({ selectedModelData, activeTab }: Props) {
  const {
    subModelsByModelIdData: subModels,
    subModelsByModelIdLoading: isLoading,
  } = useGetSubModelsByModelId(selectedModelData.id);
  // ⭐ Polished Loading State
  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );

  // No data found
  if (!subModels || subModels.length === 0) return <CommonNotFound />;

  // Map subModels by type
  const subModelMap = {
    audio: subModels.find((s) => s.type === 'audio'),
    photo: subModels.find((s) => s.type === 'photo'),
    video: subModels.find((s) => s.type === 'video'),
  };

  const selectedSubModel = subModelMap[activeTab];

  // If no sub-model for selected tab
  if (!selectedSubModel || selectedSubModel.status !== 'cloned')
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-linear-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl mt-8 transition-all duration-300 hover:border-slate-400 hover:shadow-md">
        <div className="bg-white rounded-full p-4 mb-4 shadow-sm">
          <BotOff className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Model Not Trained Yet
        </h3>
        <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
          This model hasn’t been trained yet. Please train the model to activate
          it and start generating content.
        </p>
      </div>
    );

  return (
    <div className="space-y-5">
      {activeTab === 'audio' && (
        <UseAudioSubModelComp subModelByIdData={selectedSubModel} />
      )}
      {activeTab === 'photo' && (
        <UsePhotoSubModelComp subModelByIdData={selectedSubModel} selectedModelData={selectedModelData}  />
      )}
      {activeTab === 'video' && (
        <UseVideoSubModelComp subModelByIdData={selectedSubModel} />
      )}
    </div>
  );
}

export default GenerateCompBottomSection;
