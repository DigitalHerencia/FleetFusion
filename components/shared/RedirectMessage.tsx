"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import Link from 'next/link';
import { MapPinned } from 'lucide-react';

export function RedirectingMessage() {
  // Fade in/out state
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Fade in on mount
    return () => {
      setVisible(false); // Fade out on unmount (for future extensibility)
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 h-full w-full overflow-hidden bg-black transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <Image
        src="/sunset_loading.png"
        alt="Loading Background"
        fill
        style={{ objectFit: 'cover', zIndex: 1 }}
        className="h-full w-full transition-opacity duration-1000"
        priority
      />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 transition-opacity duration-700">
        <div className="flex flex-col items-center w-full max-w-2xl text-center" style={{ minHeight: '60vh', justifyContent: 'flex-start', marginTop: '8vh' }}>
          {/* Logo and brand moved up */}
          <div className="flex flex-col items-center space-y-6 mb-10">
            <div className="flex items-center space-x-3">
              <MapPinned className='mr-1 h-12 w-12 text-blue-500 drop-shadow-lg' />
              <h1 className='text-6xl font-extrabold text-white dark:text-white drop-shadow-lg'>
                FleetFusion
              </h1>
            </div>
          </div>
          {/* Modern spinner, more refined and separated */}
          <div className="flex flex-col items-center space-y-6">
            <LoadingSpinner size="xl" className="mb-4" />
            <h1 className="text-2xl font-bold text-white tracking-wide">Loading...</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <RedirectingMessage />;
}
