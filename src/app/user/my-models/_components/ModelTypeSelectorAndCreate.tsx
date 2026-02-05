import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CreateAudioModel from './CreateAudioModel';
import CreatePhotoVideoSubModel from './CreatePhotoVideoSubModel';
import ModelDetailSection from './ModelDetailSection';
import { ModelTableType } from '@/db/schema/models';
import { User } from 'next-auth';

type Props = {
  modelByIdData?: ModelTableType;
  user?: User;
  subModelType: 'audio' | 'video' | 'photo';
  generationCount?: number
};

function ModelTypeSelectorAndCreate({
  modelByIdData,
  subModelType,
  user,
  generationCount
}: Props) {
  const title = subModelType?.[0]?.toUpperCase() + subModelType?.slice(1);
  return (
    <div>
      {modelByIdData && (
        <ModelDetailSection modalByIdData={modelByIdData} user={user} generationCount={generationCount} />
      )}
      <Card className="px-5 mt-5">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {' '}
            {title} Sub Model
          </CardTitle>
          <CardDescription>
            Enter model details and upload at least 100 high quality{' '}
            {subModelType} from all angles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subModelType === 'audio' ? (
            <CreateAudioModel modelName={modelByIdData?.name ?? 'unknown'} />
          ) : (
            <CreatePhotoVideoSubModel
              subModelType={subModelType}
              modelName={modelByIdData?.name ?? 'unknown'}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ModelTypeSelectorAndCreate;
