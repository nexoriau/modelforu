'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function ScrollTop() {
  const pathName = usePathname();
  useEffect(() => {
    if (typeof window !== undefined) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathName]);
  return null;
}

export default ScrollTop;
