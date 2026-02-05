'use client';
import { usePathname } from 'next/navigation';
import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  withTopPadding?: boolean;
}

export default function MainContent({
  children,
  className = '',
  withTopPadding = true,
}: MainContentProps) {
  return (
    <main
      className={`${withTopPadding ? 'pt-[65px]' : ''} bg-gray-50 ${className}`}
    >
      {children}
    </main>
  );
}
