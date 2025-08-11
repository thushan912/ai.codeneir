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
    <div className="h-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chat' | 'create')} className="h-full flex flex-col">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-2 bg-black/20 border-b border-white/10 rounded-none h-12 flex-shrink-0">
          <TabsTrigger 
            value="chat" 
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 gap-2"
          >
            <Image className="h-4 w-4" />
            Create
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="chat" className="flex-1 min-h-0 m-0 border-0 p-0 overflow-hidden">
          <ChatPanel />
        </TabsContent>
        
        <TabsContent value="create" className="flex-1 min-h-0 m-0 border-0 p-0 overflow-hidden">
          <ImageStudio />
        </TabsContent>
      </Tabs>
    </div>
  );
}
