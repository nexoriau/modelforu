'use client';

import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useState } from 'react';

export default function ModelSelector() {
  const [selectValue, setSelectValue] = useState('1');
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Model Type
          </h1>
          <p className="text-sm text-gray-500">
            you can create new model and create in existing model also
          </p>
        </div>

        {/* Select and Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger className="flex-1 h-12 text-gray-400 bg-white border border-gray-200 rounded-lg">
              <SelectValue placeholder="Select Model">
                {selectValue && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Model {selectValue}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Am ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {['1', '2', '3'].map((val) => (
                <SelectItem
                  key={val}
                  value={val}
                  className="flex items-start justify-start gap-3"
                >
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Model {val}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Am ipsum dolor sit amet, consectetur adipiscing elit. sed
                      do eiusmod tempor in
                    </p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href={'/user/my-models/create'}>
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
