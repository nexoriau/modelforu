import { auth } from "@/app/auth/_services/auth";
import ModelForYouHero from "../_components/ModelForYou";
import OnboardingTour from "../_components/OnboardingTour";
import RecentModelActivity from "../_components/RecentModelActivityCard";
import { getGenerationsByUserId } from "../my-models/_services/generate/generate.queries";
import MyModels from "../my-models/_components/MyModels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const { generations: recentGenerations } = await getGenerationsByUserId(
    session?.user.id,
  );
  return (
    <>
      <OnboardingTour userEmail={session?.user.email ?? undefined} />

      <div className="min-h-screen rounded-2xl bg-white border border-gray-200 shadow-xl">
        <div className="p-6">
          <ModelForYouHero />
        </div>

        <div>
          <MyModels />
        </div>

        {/* Step 3 */}
        <div>
          <RecentModelActivity
            recentGenerations={recentGenerations}
            userId={session?.user.id}
          />
        </div>
      </div>
    </>
  );
}
