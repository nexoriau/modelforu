import { SubModelTableType } from '@/db/schema/sub-model';
import {
  Loader2,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  Play,
  Camera,
  Video,
  Mic,
  XCircle,
  Circle,
} from 'lucide-react';

// Define the required types for the new structure
export type ModalData = { id: string };
export type SubModelArrayData = { type: string; id: string }[];

// --- START OF REFRACTORED CODE ---

export type CloneStatus =
  | 'cloning'
  | 'cloned'
  | 'canceled'
  | 'pending'
  | 'idle';

export const getStatusConfig = (status: CloneStatus) => {
  const configs = {
    cloning: {
      label: 'CLONING IN PROGRESS',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      icon: Loader2,
      iconClassName: 'animate-spin',
    },
    cloned: {
      label: 'CLONED',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
      icon: CheckCircle2,
      iconClassName: '',
    },
    canceled: {
      label: 'CANCELED',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
      icon: XCircle,
      iconClassName: '',
    },
    pending: {
      label: 'PENDING SETUP',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-700',
      icon: Clock,
      iconClassName: '',
    },
    idle: {
      label: 'CREATE TO START',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-600',
      icon: Circle,
      iconClassName: '',
    },
  };
  return configs[status];
};

export const getButtonConfig = ({
  status,
  type,
  modalByIdData,
  subModelDataByModel,
  disabled,
}: {
  status: CloneStatus;
  type: string;
  modalByIdData: ModalData;
  subModelDataByModel: SubModelArrayData;
  disabled: boolean;
}) => {
  switch (status) {
    case 'pending':
      return {
        asChild: true,
        disabled,
        variant: 'default' as const,
        className: '',
        content: (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Start cloning
          </>
        ),
        href: `/user/my-models/${modalByIdData.id}/sub-model/${type}/create`,
      };

    case 'idle':
      return {
        asChild: true,
        disabled,
        variant: 'default' as const,
        className: '',
        content: (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Start cloning
          </>
        ),
        href: `/user/my-models/${modalByIdData.id}/sub-model/${type}/create`,
      };

    case 'cloning':
      return {
        asChild: false,
        disabled,
        variant: 'secondary' as const,
        className: 'bg-blue-200 text-black cursor-not-allowed',
        content: (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </div>
        ),
        href: null,
      };

    case 'cloned':
      const subModel = subModelDataByModel.find((val) => val.type === type);
      return {
        asChild: true,
        disabled,
        variant: 'default' as const,
        className: 'bg-green-600 hover:bg-green-700 text-white',
        content: (
          <>
            <Play className="w-4 h-4 mr-2" />
            Ready to use
          </>
        ),
        // href: `/user/my-models/${modalByIdData.id}/sub-model/${type}/${subModelId?.id}/use`,
        href: `/user/generate?model=${modalByIdData.id}&type=${type}`,
      };

    case 'canceled':
      return {
        asChild: true,
        disabled,
        variant: 'default' as const,
        className: 'bg-orange-600 hover:bg-orange-700 text-white',
        content: (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry cloning
          </>
        ),
        href: `/user/my-models/${modalByIdData.id}/sub-model/${type}/create`,
      };

    default:
      return {
        asChild: true,
        disabled,
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
        content: (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start cloning
          </>
        ),
        href: `/user/my-models/${modalByIdData.id}/sub-model/${type}/create`,
      };
  }
};
// --- END OF REFRACTORED CODE ---

const getStatusMessage = (
  status: CloneStatus,
  type: 'audio' | 'video' | 'photo',
  count: number = 0
): string => {
  const messages = {
    cloning: {
      photo: `${count} pictures provided. Processing...`,
      video: `${count} video samples provided. Processing...`,
      audio: `${count} audio samples provided. Processing...`,
    },
    cloned: {
      photo: `${count} pictures processed successfully. Your photo clone is ready to use.`,
      video: `${count} video samples processed successfully. Your video clone is ready to use.`,
      audio: `${count} audio samples processed successfully. Your voice clone is ready to use.`,
    },
    canceled: {
      photo: 'Cloning was canceled. You can retry the process.',
      video: 'Cloning was canceled. You can retry the process.',
      audio: 'Cloning was canceled. You can retry the process.',
    },
    pending: {
      photo:
        'Your photo model request is pending approval. We will review and then inform you shortly.',
      video:
        'Your video model request is pending approval. We will review and then inform you shortly.',
      audio:
        'Your voice model request is pending approval. We will review and then inform you shortly.',
    },

    idle: {
      photo:
        "This photo model hasn't been trained yet. Please upload the required files to activate it.",
      video:
        "This video model hasn't been trained yet. Please upload the required files to activate it.",
      audio:
        "This voice model hasn't been trained yet. Please upload the required files to activate it.",
    },
  };

  return messages[status][type];
};

export const cloneTypesFunction = ({
  photoSubModel,
  videoSubModel,
  audioSubModel,
}: {
  photoSubModel?: SubModelTableType;
  videoSubModel?: SubModelTableType;
  audioSubModel?: SubModelTableType;
}) => [
  {
    id: photoSubModel?.id ?? 'photo',
    icon: Camera,
    title: 'Photo',
    status: photoSubModel?.status ?? ('idle' as CloneStatus),
    message: getStatusMessage(
      photoSubModel?.status ?? 'idle',
      'photo',
      photoSubModel?.itemsLength ?? 0
    ),
    count: photoSubModel?.itemsLength ?? 0,
    type: 'photo',
  },
  {
    id: videoSubModel?.id ?? 'video',
    icon: Video,
    title: 'Video',
    status: videoSubModel?.status ?? ('idle' as CloneStatus),
    message: getStatusMessage(
      videoSubModel?.status ?? 'idle',
      'video',
      videoSubModel?.itemsLength ?? 0
    ),
    count: videoSubModel?.itemsLength ?? 0,
    type: 'video',
  },
  {
    id: audioSubModel?.id ?? 'audio',
    icon: Mic,
    title: 'Audio',
    status: audioSubModel?.status ?? ('idle' as CloneStatus),
    message: getStatusMessage(
      audioSubModel?.status ?? 'idle',
      'audio',
      audioSubModel?.itemsLength ?? 0
    ),
    count: audioSubModel?.itemsLength ?? 0,
    type: 'audio',
  },
];
