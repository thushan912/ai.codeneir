// components/MobileTabsWrapper.tsx
'use client';

import { MessageCircle, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import ChatPanel from './ChatPanel';
import ImageStudio from './ImageStudio';

export default function MobileTabsWrapper() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div className="h-full overflow-hidden flex flex-col bg-slate-900">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'create')} className="h-full flex flex-col">
        {/* Tab Navigation - Always visible below header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-violet-400/30 shadow-lg backdrop-blur-sm sticky top-[64px] z-40">
          <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-none h-16 gap-0 p-0">
            <TabsTrigger 
              value="chat" 
              className="
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/30 data-[state=active]:to-indigo-600/30 
                data-[state=active]:text-white data-[state=active]:shadow-lg
                text-white/70 hover:text-white hover:bg-white/10
                gap-2 rounded-none border-b-3 border-transparent 
                data-[state=active]:border-violet-400 data-[state=active]:border-b-3
                h-full text-xs font-semibold transition-all duration-300
                flex flex-col items-center justify-center px-2 relative z-10
              "
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-center leading-tight">Text Generation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/30 data-[state=active]:to-indigo-600/30 
                data-[state=active]:text-white data-[state=active]:shadow-lg
                text-white/70 hover:text-white hover:bg-white/10
                gap-2 rounded-none border-b-3 border-transparent 
                data-[state=active]:border-violet-400 data-[state=active]:border-b-3
                h-full text-xs font-semibold transition-all duration-300
                flex flex-col items-center justify-center px-2 relative z-10
              "
            >
              <Image className="h-5 w-5" aria-label="Create images" />
              <span className="text-center leading-tight">Image Generation</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 border-0 p-0 overflow-hidden data-[state=inactive]:hidden">
            <ChatPanel />
          </TabsContent>
          
          <TabsContent value="create" className="h-full m-0 border-0 p-0 overflow-hidden data-[state=inactive]:hidden">
            <ImageStudio />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
