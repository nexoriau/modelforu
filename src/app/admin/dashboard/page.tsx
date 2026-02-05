export const dynamic = "force-dynamic";

import { auth } from "@/app/auth/_services/auth";
import { getUserById } from "@/lib/utils-functions/getUserById";
import {
  getAllDistributedTokens,
  getAllGeneratedPhotosCount,
  getAllGeneratedVideosCount,
  getAllModelsCount,
  getAllReceivedAmount,
  getAllUsersCount,
} from "./_services/dashboard.queries";
import { getAllSubModels } from "@/app/user/my-models/_services/sub-model/subModel.queries";
import AdminDashboardClient from "./_components/AdminDashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const currentUser = await getUserById(session?.user.id);
  const [
    totalUsers,
    tokensDistributed,
    receivedAmount,
    allModelsCount,
    allPhotosGeneratedCount,
    allVideosGeneratedCount,
    allSubModels,
  ] = await Promise.all([
    getAllUsersCount(),
    getAllDistributedTokens(),
    getAllReceivedAmount(),
    getAllModelsCount(),
    getAllGeneratedPhotosCount(),
    getAllGeneratedVideosCount(),
    getAllSubModels(),
  ]);

  const allPendingSubModelsRequests = allSubModels.filter(
    (v) => v.status === "pending",
  );
  const allTrainedSubModels = allSubModels.filter((v) => v.status === "cloned");

  const dashboardData = {
    totalUsers: totalUsers ?? 0,
    tokensDistributed: tokensDistributed?.toLocaleString() ?? 0,
    receivedAmount: receivedAmount ?? 0,
    allSubModelsCount: allSubModels.length,
    pendingSubModelsCount: allPendingSubModelsRequests.length,
    trainedSubModelsCount: allTrainedSubModels.length,
    photosGenerated: allPhotosGeneratedCount?.toLocaleString() ?? 0,
    videosGenerated: allVideosGeneratedCount?.toLocaleString() ?? 0,
  };

  return (
    <AdminDashboardClient currentUser={currentUser} data={dashboardData} />
  );
}
