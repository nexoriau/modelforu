import { LucideLoader } from 'lucide-react';
import React from 'react';

function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <LucideLoader size={30} className="animate-spin" />
    </div>
  );
}

export default Loading;
