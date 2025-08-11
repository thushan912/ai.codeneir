'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import ChatPanel from '@/components/ChatPanel';
import ImageStudio from '@/components/ImageStudio';
import MobileTabsWrapper from '@/components/MobileTabsWrapper';
import { useAppStore } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const { setIsMobile } = useAppStore();

  useEffect(() => {
    const checkMobile = () => {
      // Use a smaller breakpoint to ensure tablets and phones get mobile layout
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {/* Mobile Layout - Show tabs on small screens */}
        <div className="md:hidden h-full flex flex-col">
          <MobileTabsWrapper />
        </div>
        
        {/* Desktop Layout - Show split view on larger screens */}
        <div className="hidden md:block h-full">
          <div className="h-full grid grid-cols-[1.2fr_1fr] gap-0">
            {/* Chat Panel */}
            <div className="border-r border-white/10 min-h-0 overflow-hidden">
              <ChatPanel />
            </div>
            
            {/* Image Studio */}
            <div className="min-h-0 overflow-hidden">
              <ImageStudio />
            </div>
          </div>
        </div>
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
