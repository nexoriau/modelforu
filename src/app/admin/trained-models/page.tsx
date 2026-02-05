import { auth } from "@/app/auth/_services/auth";
import TrainedModelsTable from "./_components/TrainedModelsTable";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TrainedModelsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <TrainedModelsTable
      initialModels={[]}
      initialGroups={[]}
      currentUserId={session.user.id}
    />
  );
}
