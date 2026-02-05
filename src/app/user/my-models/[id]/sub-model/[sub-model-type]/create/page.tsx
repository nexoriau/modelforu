import { auth } from "@/app/auth/_services/auth";
import ModelTypeSelectorAndCreate from "@/app/user/my-models/_components/ModelTypeSelectorAndCreate";
import {
  getModelById,
  getModelGenerationCount,
} from "@/app/user/my-models/_services/main-model/mainModel.queries";

type Params = {
  "sub-model-type": "audio" | "video" | "photo";
  id: string;
};
export const dynamic = "force-dynamic";

async function CreateModel({ params }: { params: Promise<Params> }) {
  const awaitedParams = await params;
  const session = await auth();
  const user = session?.user;
  const subModelType = awaitedParams["sub-model-type"];
  const [modelByIdData, generationCount] = await Promise.all([
    getModelById(awaitedParams.id),
    getModelGenerationCount(awaitedParams.id),
  ]);

  return (
    <div>
      <ModelTypeSelectorAndCreate
        subModelType={subModelType}
        user={user}
        modelByIdData={modelByIdData}
        generationCount={generationCount}
      />
    </div>
  );
}

export default CreateModel;
