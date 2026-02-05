import { auth } from "@/app/auth/_services/auth";
import CommonNotFound from "@/components/shared/CommonNotFound";
import { getUserById } from "@/lib/utils-functions/getUserById";
import {
  getAllAudioSubModelsByUserId,
  getAllPhotoSubModelsByUserId,
  getAllVideoSubModelsByUserId,
} from "../my-models/_services/sub-model/subModel.queries";
import SubModelsTable from "../my-models/_components/SubModelsTable";

export const dynamic = "force-dynamic";

async function SingleModelPage() {
  const session = await auth();
  const user = await getUserById(session?.user.id);

  if (!user?.id) {
    return <CommonNotFound collection="User" />;
  }

  const [audioSubModels, videoSubModels, photoSubModels] = await Promise.all([
    getAllAudioSubModelsByUserId(user.id),
    getAllVideoSubModelsByUserId(user.id),
    getAllPhotoSubModelsByUserId(user.id),
  ]);

  return (
    <div className="space-y-4">
      {/* <ModelSelector /> */}
      <SubModelsTable
        audioSubModels={audioSubModels}
        videoSubModels={videoSubModels}
        photoSubModels={photoSubModels}
      />
    </div>
  );
}

export default SingleModelPage;
