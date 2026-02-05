'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Download,
  Settings,
  ChevronDown,
  Sliders,
  LucideLoader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ModelTableType } from '@/db/schema/models';
import { SubModelTableType } from '@/db/schema/sub-model';
import { toast } from 'sonner';
import { createGenerate } from '../_services/generate/generate.actions';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATIONS_QUERY_KEY } from '@/app/_others/notification/actions/use-notification.action';

export default function UseAudioSubModelComp({
  subModelByIdData,
}: {
  subModelByIdData: SubModelTableType;
}) {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [stability, setStability] = useState([50]);
  const [similarity, setSimilarity] = useState([75]);
  const [styleExaggeration, setStyleExaggeration] = useState([30]);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const characterCount = text.length;
  const maxCharacters = 5000;

  const handleGenerate = () => {
    try {
      startTransition(async () => {
        const res = await createGenerate({
          description: text,
          itemsLength: 0,
          modelId: subModelByIdData.modelId,
          subModelId: subModelByIdData.id,
          type: 'audio',
          mediaUrl: [],
          generationTime: 0,
        });
        if (res?.error) {
          toast.error(res.message);
          return;
        }
        await queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_QUERY_KEY,
        });

        toast.success(`Audio Generated!`);
        setText('');
      });
    } catch (error) {
      console.log(error);
      toast.error('Error while generating');
    }
  };

  return (
    <div className="w-full">
      {/* Text Input Card */}
      <h1 className="font-bold text-4xl mb-4">Audio Sub Model</h1>
      <Card className="mb-8 border shadow-lg">
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-40 text-gray-700 text-sm leading-relaxed resize-none focus-visible:ring-0 p-3 mb-6"
            placeholder="Enter your text here..."
          />

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Voice Selection */}
              <div className="flex items-center gap-2">
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className=" rounded-full w-40 h-10! text-sm font-medium">
                    <SelectValue placeholder="Rachel">
                      {selectedVoice && (
                        <div className="flex items-center justify-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {selectedVoice[0].toUpperCase()}
                            </span>
                          </div>
                          {selectedVoice[0].toUpperCase() +
                            selectedVoice.slice(1)}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rachel">Rachel</SelectItem>
                    <SelectItem value="john">John</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="david">David</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Settings Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Sliders className="w-5 h-5 text-gray-600" />
                      </div>
                      <SheetTitle className="text-xl font-semibold">
                        Settings
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  <div className="space-y-6 px-4">
                    {/* Model Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Model
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Model For You Multilingual v2
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                          Our cutting-edge Turbo v2.5 text-to-speech model is
                          designed for situations that demand unparalleled
                          control over both the content and the prosody of the
                          generated speech across various languages.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                            English
                          </span>
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                            Hindi
                          </span>
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                            +26 more
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stability Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Stability
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>More variable</span>
                        <span>More stable</span>
                      </div>
                      <Slider
                        value={stability}
                        onValueChange={setStability}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Similarity Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Similarity
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                      <Slider
                        value={similarity}
                        onValueChange={setSimilarity}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Style Exaggeration Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Style Exaggeration
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>None</span>
                        <span>Exaggerated</span>
                      </div>
                      <Slider
                        value={styleExaggeration}
                        onValueChange={setStyleExaggeration}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStability([50]);
                        setSimilarity([75]);
                        setStyleExaggeration([30]);
                      }}
                      className="h-11 px-6 rounded-full"
                    >
                      Reset
                    </Button>
                    <SheetClose asChild>
                      <Button className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full">
                        Generate Speech
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-4">
              {/* Character Count */}
              <span className="text-sm text-gray-400">
                {characterCount}/ {maxCharacters}
              </span>

              {/* Generate Button */}
              <Button
                disabled={text.length < 10 || isPending}
                onClick={handleGenerate}
                className="h-10 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium"
              >
                {isPending && <LucideLoader2 className="size-4 animate-spin" />}
                Generate speech
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Play Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center shrink-0 transition-colors"
            >
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </button>

            {/* Waveform */}
            <div className="flex-1 flex items-center justify-center gap-1 h-12">
              {[...Array(100)].map((_, i) => {
                const heights = [20, 35, 25, 40, 30, 45, 35, 50, 40, 30];
                const height = heights[i % heights.length];
                return (
                  <div
                    key={i}
                    className="w-1 bg-gray-900 rounded-full transition-all"
                    style={{
                      height: `${height}px`,
                      opacity: 0.7 + Math.random() * 0.3,
                    }}
                  />
                );
              })}
            </div>

            {/* Download Button */}
            <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center shrink-0 transition-colors">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
