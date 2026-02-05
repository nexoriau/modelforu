export const dynamic = 'force-dynamic';

import { getAllSubModels } from '@/app/user/my-models/_services/sub-model/subModel.queries';
import React from 'react';
import SubModelsRequestsTable from '../_components/SubModelsRequestsTable';

async function SubModelsRequestsPage() {
  const allSubModels = await getAllSubModels();
  return (
    <div>
      <SubModelsRequestsTable allSubModels={allSubModels} />
    </div>
  );
}

export default SubModelsRequestsPage;
