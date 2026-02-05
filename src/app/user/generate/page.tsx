import React from "react";
import GenerateComp from "../_components/GenerateComp";
import {
  getAllAddedDefaultModels,
  getModelsByUserId,
} from "../my-models/_services/main-model/mainModel.queries";
import { auth } from "@/app/auth/_services/auth";

export const dynamic = "force-dynamic";

async function GeneratePage() {
  const session = await auth();
  const user = session?.user;
  const [modelsData, res] = await Promise.all([
    getModelsByUserId(user?.id),
    getAllAddedDefaultModels(),
  ]);

  const defaultAddedModels = res?.length ? res.map((v) => v.model) : [];

  return (
    <div>
      <GenerateComp modelsData={[...defaultAddedModels]} />
    </div>
  );
}

export default GeneratePage;
