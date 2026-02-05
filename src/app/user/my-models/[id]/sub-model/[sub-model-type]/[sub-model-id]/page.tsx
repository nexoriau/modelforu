import { auth } from '@/app/auth/_services/auth';
import CreateAudioModel from '@/app/user/my-models/_components/CreateAudioModel';
import CreatePhotoVideoSubModel from '@/app/user/my-models/_components/CreatePhotoVideoSubModel';
import ModelDetailSection from '@/app/user/my-models/_components/ModelDetailSection';
import { getModelById, getModelGenerationCount } from '@/app/user/my-models/_services/main-model/mainModel.queries';
import { getSubModelById } from '@/app/user/my-models/_services/sub-model/subModel.queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Params = {
  'sub-model-id': string;
  'sub-model-type': 'audio' | 'video' | 'photo';
  id: string;
};

async function EditSubModelById({ params }: { params: Promise<Params> }) {
  const awaitedParams = await params;
  const session = await auth();
  const user = session?.user;
  const subModelType = awaitedParams['sub-model-type'];
  const isTypeAvailable = ['audio', 'video', 'photo'].includes(subModelType);

  if (!isTypeAvailable) {
    redirect(`user/models/${awaitedParams.id}`);
  }

  const [modelDataById, generationCount, subModelDataById] = await Promise.all([
    getModelById(awaitedParams.id),
    getModelGenerationCount(awaitedParams.id),
    getSubModelById(awaitedParams['sub-model-id']),
  ]);

  const title = subModelType ? subModelType[0].toUpperCase() + subModelType.slice(1) : undefined;

  return (
    <div>
      {modelDataById && (
        <ModelDetailSection modalByIdData={modelDataById} user={user} generationCount={generationCount} />
      )}
      <Card className="px-5 mt-5">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {title} Sub Model {modelDataById?.name}
          </CardTitle>
          <CardDescription>
            Enter model details and upload at least 100 high quality {subModelType} from all angles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subModelType === 'audio' ? (
            <CreateAudioModel subModelDataById={subModelDataById} modelName={modelDataById?.name ?? 'unknown'} />
          ) : (
            <CreatePhotoVideoSubModel
              modelName={modelDataById?.name ?? 'unknown'}
              subModelType={subModelType}
              subModelDataById={subModelDataById}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EditSubModelById;
