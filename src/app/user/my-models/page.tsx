import { auth } from "@/app/auth/_services/auth";
import { getUserById } from "@/lib/utils-functions/getUserById";
import {
  getAllAddedDefaultModels,
  getModelsByUserId,
} from "./_services/main-model/mainModel.queries";
import MainModelsComp from "./_components/MainModelsComp";

export const dynamic = "force-dynamic";

export default async function MyModelsPage() {
  const session = await auth();
  const user = await getUserById(session?.user.id);
  const [modelsData, res] = await Promise.all([
    getModelsByUserId(user?.id),
    getAllAddedDefaultModels(),
  ]);

  const defaultAddedModels = res?.length ? res.map((v) => v.model) : [];

  return (
    <div className="space-y-5">
      <MainModelsComp
        initialModels={[ ...defaultAddedModels]}
        user={user}
      />
    </div>
  );
}
