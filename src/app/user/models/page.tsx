import { auth } from '@/app/auth/_services/auth';
import { getUserById } from '@/lib/utils-functions/getUserById';
import { getDefaultModels } from '../my-models/_services/main-model/mainModel.queries';
import DefaultModelsComp from '../my-models/_components/DefaultModelsComp';

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const session = await auth();
  const user = await getUserById(session?.user.id);
  const defaultModelsList = await getDefaultModels();

  return (
    <div className="space-y-5">
      <DefaultModelsComp initialModels={defaultModelsList} />
    </div>
  );
}
