import UseAudioSubModelComp from '@/app/user/my-models/_components/UseAudioSubModelComp';
import UsePhotoSubModelComp from '@/app/user/my-models/_components/UsePhotoSubModelComp';
import UseVideoSubModelComp from '@/app/user/my-models/_components/UseVideoSubModelComp';
import { getModelById } from '@/app/user/my-models/_services/main-model/mainModel.queries';
import { getSubModelById } from '@/app/user/my-models/_services/sub-model/subModel.queries';
import CommonNotFound from '@/components/shared/CommonNotFound';
import React from 'react';

async function UseModelPage({
  params,
}: {
  params: Promise<{
    'sub-model-type': string;
    'sub-model-id': string;
    id: string;
  }>;
}) {
  const awaitedParams = await params;
  const subModelByIdData = await getSubModelById(awaitedParams['sub-model-id']);
    const modalByIdData = await getModelById(subModelByIdData?.modelId);
  const subModelType = awaitedParams['sub-model-type'];

  if (!subModelByIdData) return <CommonNotFound />;
  return (
    <div className="space-y-5">
      {subModelType === 'audio' && (
        <UseAudioSubModelComp subModelByIdData={subModelByIdData} />
      )}
      {subModelType === 'photo' && modalByIdData && (
        <UsePhotoSubModelComp subModelByIdData={subModelByIdData} selectedModelData={modalByIdData} />
      )}
      {subModelType === 'video' && (
        <UseVideoSubModelComp subModelByIdData={subModelByIdData} />
      )}
    </div>
  );
}

export default UseModelPage;
