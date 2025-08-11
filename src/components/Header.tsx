// components/Header.tsx
'use client';

import { Moon, Sun, Monitor, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { fetchModels } from '@/lib/pollinations';

export default function Header() {
  const {
    theme,
    setTheme,
    chatModel,
    setChatModel,
    imageModel,
    setImageModel,
    clearChat,
    clearImages
  } = useAppStore();

  const [textModels, setTextModels] = useState<string[]>(['mistral', 'llama-3.1-8b', 'gemma-2-9b-it']);
  const [imageModels, setImageModels] = useState<string[]>(['flux', 'turbo', 'stability']);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    // Fetch available models with enhanced error handling
    const loadModels = async () => {
      setIsLoadingModels(true);
      
      try {
        const [textModelList, imageModelList] = await Promise.allSettled([
          fetchModels('text'),
          fetchModels('image')
        ]);

        if (textModelList.status === 'fulfilled' && Array.isArray(textModelList.value) && textModelList.value.length > 0) {
          setTextModels(textModelList.value.filter(Boolean));
        }

        if (imageModelList.status === 'fulfilled' && Array.isArray(imageModelList.value) && imageModelList.value.length > 0) {
          setImageModels(imageModelList.value.filter(Boolean));
        }
      } catch (error) {
        console.warn('Error loading models, using defaults:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const ThemeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor
  }[theme];

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Chat & Create
          </div>
          <div className="text-xs text-white/60 hidden sm:block">
            powered by codeneir inc
          </div>
        </div>

        {/* Model Pickers */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-white/70">Chat:</span>
            <Select value={chatModel} onValueChange={setChatModel}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {textModels.map((model, index) => (
                  <SelectItem key={`text-${model}-${index}`} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-white/70">Image:</span>
            <Select value={imageModel} onValueChange={setImageModel}>
              <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {imageModels.map((model, index) => (
                  <SelectItem key={`image-${model}-${index}`} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              clearChat();
              clearImages();
            }}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
