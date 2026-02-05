'use client';

import { MoreVertical } from 'lucide-react';
import Image from 'next/image';

interface ModelCard {
  id: number;
  image: string;
  title: string;
  description: string;
  progress: number;
  timeLeft: string;
  status: string;
}

const modelCards: ModelCard[] = [
  {
    id: 1,
    image: '/dummy-nature.png',
    title: 'Flying Dragon Picture',
    description: 'The user Prompt or Generation details will be shown here',
    progress: 95,
    timeLeft: '2 minutes Left',
    status: 'In Progress',
  },
  {
    id: 2,
    image: '/dummy-nature.png',
    title: 'Flying Dragon Picture',
    description: 'The user Prompt or Generation details will be shown here',
    progress: 95,
    timeLeft: '2 minutes Left',
    status: 'In Progress',
  },
  {
    id: 3,
    image: '/dummy-nature.png',
    title: 'Flying Dragon Picture',
    description: 'The user Prompt or Generation details will be shown here',
    progress: 95,
    timeLeft: '2 minutes Left',
    status: 'In Progress',
  },
  {
    id: 4,
    image: '/dummy-nature.png',
    title: 'Flying Dragon Picture',
    description: 'The user Prompt or Generation details will be shown here',
    progress: 95,
    timeLeft: '2 minutes Left',
    status: 'In Progress',
  },
];

// Main Dashboard Component
export default function ActiveModels() {
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="w-full max-w-7xl mx-auto ">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-16">
          <div data-tour="active-models">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Active Models
            </h2>
            <p className="text-sm text-gray-500">
              Your Cloning, Pending Models & Generations Appear Here
            </p>
          </div>
          <button className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <span className="text-lg leading-none">+</span>
            Create New
          </button>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-4 ">
          {modelCards.map((card) => (
            <div
              key={card.id}
              className="bg-white border h-[240px] border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {/* Card Header with Image and Menu */}
              <div className="flex items-start justify-between mb-3">
                <div className="size-20 rounded-lg relative left-[30%] -top-14 overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    fill
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full absolute object-cover"
                  />
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Card Content */}
              <div className="space-y-3 relative -top-8">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700">
                      {card.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-300"
                      style={{ width: `${card.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-600">{card.timeLeft}</span>
                  <span className="text-xs text-gray-500 border border-gray-300 px-3 py-1 rounded-full">
                    {card.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
