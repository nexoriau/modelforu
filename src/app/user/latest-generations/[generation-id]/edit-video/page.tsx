import VideoEditor from '@/app/user/my-models/_components/VideoEditor';
import { getGenerationsById } from '@/app/user/my-models/_services/generate/generate.queries';
import React from 'react';

type Params = Promise<{
  'generation-id': string;
}>;

async function EditVideo({ params }: { params: Params }) {
  const awaitedParams = await params;
  const res = await getGenerationsById(awaitedParams['generation-id']);

  if (!res?.id) {
    return (
      <h1 className="py-32 text-center font-semibold text-2xl text-slate-600">
        No Video Found
      </h1>
    );
  }


  return (
    <div>
      <VideoEditor isEdit={true} initialVideoUrl={res.mediaUrl[0]} generatedDataId={res.id} />
    </div>
  );
}

export default EditVideo;
