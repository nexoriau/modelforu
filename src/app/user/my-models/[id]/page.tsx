import React from "react";
import CommonNotFound from "@/components/shared/CommonNotFound";
import {
  getAllSubModelsByModelId,
  getSubModelById,
} from "../_services/sub-model/subModel.queries";
import {
  getModelById,
  getModelGenerationCount,
} from "../_services/main-model/mainModel.queries";
import ModelDetailsComp from "../_components/ModelDetailComp";

export const dynamic = "force-dynamic";

async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaitedParams = await params;
  const [modalByIdData, generationCount, subModelDataByModel] =
    await Promise.all([
      getModelById(awaitedParams.id),
      getModelGenerationCount(awaitedParams.id),
      getAllSubModelsByModelId(awaitedParams.id),
    ]);

  if (!modalByIdData) return <CommonNotFound />;
  return (
    <div>
      <ModelDetailsComp
        modalByIdData={modalByIdData}
        subModelDataByModel={subModelDataByModel}
        generationCount={generationCount}
      />
    </div>
  );
}

export default ModelDetailPage;
