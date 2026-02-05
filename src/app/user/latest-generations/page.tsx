import React from "react";
import LatestGenerationsByUserId from "../_components/LatestGenerationsPageComp";
import { auth } from "@/app/auth/_services/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscardedImagesGrid } from "../_components/DiscardedImagesGrid";

export const dynamic = "force-dynamic";

async function LatestGenerationsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <Tabs defaultValue="latest">
        <TabsList>
          <TabsTrigger value="latest">Gallery</TabsTrigger>
          <TabsTrigger value="discarded">Discarded</TabsTrigger>
        </TabsList>

        <TabsContent value="latest">
          <LatestGenerationsByUserId userId={user.id} />
        </TabsContent>

        <TabsContent value="discarded">
          <DiscardedImagesGrid userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LatestGenerationsPage;
