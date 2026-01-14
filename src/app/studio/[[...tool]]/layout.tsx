'use client';

import { SessionProvider } from 'next-auth/react';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div 
        style={{ 
          height: '100vh', 
          width: '100vw',
        }}
      >
        {children}
      </div>
    </SessionProvider>
  );
}
