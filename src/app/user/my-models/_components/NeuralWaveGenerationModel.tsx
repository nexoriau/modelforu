'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LucideLoader2, CheckCircle, Clock, Download, X } from 'lucide-react';
import Image from 'next/image';

interface NeuralWaveGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
  status: string;
  generatedImage: string | null;
  isFetchingResult: boolean;
  statusData?: {
    width?: number;
    height?: number;
  };
}

export function NeuralWaveGenerationModal({
  isOpen,
  onClose,
  isGenerating,
  status,
  generatedImage,
  isFetchingResult,
  statusData,
}: NeuralWaveGenerationModalProps) {
  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `neuralwave-${Date.now()}.png`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Image Generation</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Updates */}
          {isGenerating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {status === 'QUEUED' && (
                  <>
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Queued</p>
                      <p className="text-sm text-blue-700">
                        Your job is in the queue. Waiting to start...
                      </p>
                    </div>
                  </>
                )}
                {status === 'RUNNING' && (
                  <>
                    <LucideLoader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Processing</p>
                      <p className="text-sm text-blue-700">
                        Generating your image... This may take a few moments.
                      </p>
                      {statusData?.width && (
                        <p className="text-xs text-blue-600 mt-1">
                          Resolution: {statusData.width}x{statusData.height}
                        </p>
                      )}
                    </div>
                  </>
                )}
                {isFetchingResult && (
                  <>
                    <LucideLoader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Finalizing</p>
                      <p className="text-sm text-blue-700">
                        Retrieving your generated image...
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Success State with Image */}
          {generatedImage && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <p className="font-medium text-green-900">
                  Image generated successfully!
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="relative w-full h-[400px]">
                  <Image
                    src={generatedImage}
                    alt="Generated"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 h-11 bg-gray-900 hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="h-11 px-8"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'FAILED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-900">Generation Failed</p>
              <p className="text-sm text-red-700 mt-1">
                Failed to generate image. Please try again.
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-4 w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
