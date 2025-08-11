'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import ImageStudio from '@/components/ImageStudio';
import MobileTabsWrapper from '@/components/MobileTabsWrapper';
import { useAppStore } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const { isMobile, setIsMobile } = useAppStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        {isMobile ? (
          <MobileTabsWrapper />
        ) : (
          <div className="h-full grid grid-cols-[1.2fr_1fr] gap-0">
            {/* Chat Panel */}
            <div className="border-r border-white/10">
              <ChatPanel />
            </div>
            
            {/* Image Studio */}
            <div>
              <ImageStudio />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm px-4 py-2">
        <div className="flex items-center justify-between text-xs text-white/50">
          <div>Generated with Codeneir inc</div>
          <div className="hidden sm:block">⌘+Enter to send • ⌘+Enter to generate</div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
