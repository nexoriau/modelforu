import React from "react";
import {
  getAllAddedDefaultModels,
  getDefaultModels,
  getModelsByUserId,
} from "../_services/main-model/mainModel.queries";
import { auth } from "@/app/auth/_services/auth";
import MyModelsClient from "./MyModelsClient";

async function MyModels() {
  const session = await auth();
  const defaultModlesList = await getDefaultModels();
  const modelsDataByUserId = await getModelsByUserId(session?.user?.id);
  const res = await getAllAddedDefaultModels();
  const defaultAddedModels = res?.length ? res.map((v) => v.model) : [];

  return (
    <MyModelsClient
      defaultAddedModels={defaultAddedModels}
      defaultModlesList={defaultModlesList}
    />
  );
}

export default MyModels;
