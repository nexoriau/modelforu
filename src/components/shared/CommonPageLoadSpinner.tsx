import { Loader2 } from 'lucide-react';
import React from 'react';

function CommonPageLoadSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-gray-800" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
}

export default CommonPageLoadSpinner;
