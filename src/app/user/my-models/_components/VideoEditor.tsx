'use client';

import React, {
  useState,
  useMemo,
  useRef,
  useTransition,
  useEffect,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import DownloadButton from '@/components/shared/MediaDownloadButton';
import { getFileName } from '@/lib/utils-functions/getFileExtensions';
import { toast } from 'sonner';
import {
  Scissors,
  RotateCcw,
  Crop,
  X,
  CheckCircle2,
  CropIcon,
} from 'lucide-react';
import { udpateGenerationsVideoUrl } from '../_services/generate/generate.actions';
import { useRouter } from 'next/navigation';
import { parseCloudinaryUrl } from '@/lib/utils-functions/parsedCloudinaryUrl';

interface VideoEditorProps {
  initialVideoUrl: string;
  generatedDataId?: string;
  onReset?: () => void;
  isEdit?:boolean
}

export default function VideoEditor({
  initialVideoUrl,
  generatedDataId,
  onReset,
  isEdit=false
}: VideoEditorProps) {
  const [isPendingVideoUrlUpdate, startVideoUrlUpdate] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [actualVideoDuration, setActualVideoDuration] = useState(0);
  const router = useRouter();

  // --- EDITING STATE ---
  const [cutOptions, setCutOptions] = useState<{
    start: number | null;
    end: number | null;
  }>({
    start: null,
    end: null,
  });

  const [cropOptions, setCropOptions] = useState<{
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
  }>({
    x: null,
    y: null,
    width: null,
    height: null,
  });

  useEffect(() => {
    if (initialVideoUrl) {
      const { cut, crop } = parseCloudinaryUrl(initialVideoUrl);
      setCutOptions(cut);
      setCropOptions(crop);
    }
  }, [initialVideoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setActualVideoDuration((prev) => (prev ? prev : duration));
    }
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setActualVideoDuration((prev) => (prev ? prev : duration));

      setCutOptions((prev) => ({
        ...prev,
        end: prev.end || duration,
      }));
    }
  };

  const getTransformedUrl = (url: string | null, cut: any, crop: any) => {
    if (!url) return '';

    const transformations = [];

    // 1. Handle Cutting (Trimming)
    if (cut.start !== null && cut.start !== '')
      transformations.push(`so_${cut.start}`);
    if (cut.end !== null && cut.end !== '')
      transformations.push(`eo_${cut.end}`);

    // 2. Handle Cropping
    if (crop.width && crop.height) {
      transformations.push('c_crop');
      transformations.push(`w_${crop.width}`);
      transformations.push(`h_${crop.height}`);
      if (crop.x !== null) transformations.push(`x_${crop.x}`);
      if (crop.y !== null) transformations.push(`y_${crop.y}`);
    }

    // 3. Optimization
    transformations.push('f_auto');
    transformations.push('q_auto');

    const transformationString = transformations.join(',');

    /**
     * FIX: Clean the URL
     * This regex looks for the start of the version (v12345...) or the public ID.
     * It removes everything between '/upload/' and the version/public ID.
     */
    const baseUrl = url.split('/upload/')[0];
    const restOfUrl = url.split('/upload/')[1];

    // Use regex to match the version (v followed by digits) or the filename
    // This helps us ignore any existing transformations in the middle
    const cleanPathMatch = restOfUrl.match(/(v\d+\/.*|[^/]+)$/);
    const cleanPath = cleanPathMatch ? cleanPathMatch[0] : restOfUrl;
    return `${baseUrl}/upload/${transformationString}/${cleanPath}`;
  };

  const isEditing =
    cutOptions.start ||
    cutOptions.end ||
    cropOptions.x ||
    cropOptions.y ||
    cropOptions.width ||
    cropOptions.height;

  // --- MEMOIZED URL ---
  const activeVideoUrl = useMemo(() => {
    return getTransformedUrl(initialVideoUrl, cutOptions, cropOptions);
  }, [initialVideoUrl, cutOptions, cropOptions]);

  const handleResetVideoEdit = () => {
    setCutOptions({ start: null, end: null });
    setCropOptions({ x: null, y: null, width: null, height: null });
  };

  
    const handleBack = ()=>{
    // nevigation.back()
    router.back()
  }

  return (
    <div className="w-full">
      {!isEdit?
      <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-bold">Generation Complete</span>
      </div>
     : null }

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Player */}
        <div className="relative w-full rounded-xl overflow-hidden border border-neutral-800 shadow-lg bg-black">
          {onReset && (
            <Button
              size={'icon-lg'}
              className="absolute top-2 right-2 z-20 rounded-full border-2 border-white w-8 h-8 p-0"
              variant={'destructive'}
              onClick={onReset}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {isEdit && (
            <Button
              size={'icon-lg'}
              className="absolute top-2 right-2 z-20 rounded-full border-2 border-white w-8 h-8 p-0"
              variant={'destructive'}
              onClick={handleBack}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <video
            ref={videoRef}
            key={activeVideoUrl}
            src={activeVideoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain min-h-[130px]"
            style={{ maxHeight: '80vh', display: 'block' }}
            onLoadedMetadata={handleLoadedMetadata}
          />
        </div>

        {/* Editing Controls */}
        <div className="bg-white p-4 rounded-xl border shadow-sm text-left">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Scissors className="w-4 h-4" /> Edit Video (Optional)
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetVideoEdit}
              disabled={!isEditing}
              className="h-8 text-xs text-gray-500"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset Edits
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium">Time Range</label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(cutOptions.start || 0).toString() || '0'}s -{' '}
                  {Math.round(cutOptions.end || 0).toString() || '0'}s
                  {actualVideoDuration > 0 &&
                    ` / ${Math.round(actualVideoDuration || 0).toString()}s total`}
                </span>
              </div>

              <div className="py-4">
                <Slider
                  defaultValue={[
                    cutOptions.start || 0,
                    cutOptions.end || actualVideoDuration || 10,
                  ]}
                  value={[
                    cutOptions.start || 0,
                    cutOptions.end || actualVideoDuration || 10,
                  ]}
                  max={actualVideoDuration || 60}
                  step={1}
                  minStepsBetweenThumbs={1}
                  onValueChange={(value) => {
                    setCutOptions((prev) => ({
                      ...prev,
                      start: value[0],
                      end: value[1],
                    }));
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            {/* Crop Section */}
            <div>
              <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                <CropIcon className="w-3 h-3" /> Crop (Pixels)
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-gray-500">
                    X
                  </label>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    placeholder="0"
                    value={cropOptions.x ?? ''}
                    onChange={(e) =>
                      setCropOptions((prev) => ({
                        ...prev,
                        x: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500">
                    Y
                  </label>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    placeholder="0"
                    value={cropOptions.y ?? ''}
                    onChange={(e) =>
                      setCropOptions((prev) => ({
                        ...prev,
                        y: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500">
                    Width
                  </label>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    placeholder="W"
                    value={cropOptions.width ?? ''}
                    onChange={(e) =>
                      setCropOptions((prev) => ({
                        ...prev,
                        width: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-500">
                    Height
                  </label>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    placeholder="H"
                    value={cropOptions.height ?? ''}
                    onChange={(e) =>
                      setCropOptions((prev) => ({
                        ...prev,
                        height: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="h-px bg-gray-100 my-2"></div>
            <div className="relative">
              {isEditing && generatedDataId && (
                <fieldset
                  disabled={isPendingVideoUrlUpdate}
                  className="flex items-center justify-center gap-2 my-2 w-full"
                >
                  <Button
                    variant={'outline'}
                    onClick={handleResetVideoEdit}
                    className="w-1/2"
                  >
                    Discard
                  </Button>
                  <Button
                    onClick={() => {
                      startVideoUrlUpdate(async () => {
                        const res = await udpateGenerationsVideoUrl({
                          videoUrl: activeVideoUrl,
                          generationId: generatedDataId,
                        });
                        if (res?.error) {
                          toast.error(res.message);
                          return;
                        }
                        toast.success('Video edited successfully.');
                      });
                    }}
                    className="bg-blue-500 hover:bg-blue-400 text-white w-1/2"
                  >
                    {isPendingVideoUrlUpdate ? 'Saving...' : 'Save'}
                  </Button>
                </fieldset>
              )}
              <DownloadButton
                filename={getFileName(activeVideoUrl, 'video')}
                className="flex items-center justify-center gap-2 mt-4 w-full bg-black hover:bg-black/90 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md"
                type="video"
                url={activeVideoUrl}
                showDownloadText={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
