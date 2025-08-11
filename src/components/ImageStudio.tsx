// components/ImageStudio.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Copy, Shuffle, Lock, Unlock, Loader2, Sparkles, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { imageUrl, ASPECT_RATIOS, type AspectRatio } from '@/lib/pollinations';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export default function ImageStudio() {
  const {
    imageModel,
    setImageModel,
    aspectRatio,
    setAspectRatio,
    seed,
    setSeed,
    lockSeed,
    setLockSeed,
    nologo,
    setNologo,
    enhance,
    setEnhance,
    safe,
    setSafe,
    isPrivate,
    setIsPrivate,
    addGeneratedImage
  } = useAppStore();

  const [prompt, setPrompt] = useState('a neon fox, cinematic, rim light, 85mm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { width, height } = useMemo(() => {
    return ASPECT_RATIOS[aspectRatio];
  }, [aspectRatio]);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setLoadError(false);

    // Generate new seed if not locked
    if (!lockSeed) {
      setSeed(Math.floor(Math.random() * 1000000).toString());
    }

    const url = imageUrl({
      prompt: prompt.trim(),
      model: imageModel,
      width,
      height,
      seed: lockSeed ? seed : Math.floor(Math.random() * 1000000).toString(),
      enhance,
      safe,
      private: isPrivate,
      nologo,
      referrer: 'ai-codeneir'
    });

    setCurrentImageUrl(url);

    // Simulate loading time
    const img = document.createElement('img');
    img.onload = () => {
      setIsGenerating(false);
      
      // Add to generated images store
      const imageData = {
        id: uuidv4(),
        url,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        params: {
          model: imageModel,
          width,
          height,
          seed: lockSeed ? seed : 'random',
          enhance,
          safe,
          nologo,
          private: isPrivate
        }
      };
      
      addGeneratedImage(imageData);
      toast.success('Image generated successfully!');
    };
    
    img.onerror = () => {
      setIsGenerating(false);
      setLoadError(true);
      toast.error('Failed to generate image. Please try again.');
    };
    
    img.src = url;
  };

  const downloadImage = () => {
    if (!currentImageUrl) return;
    
    fetch(currentImageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Image downloaded!');
      })
      .catch(() => {
        toast.error('Failed to download image');
      });
  };

  const copyImageUrl = () => {
    if (!currentImageUrl) return;
    
    navigator.clipboard.writeText(currentImageUrl)
      .then(() => {
        toast.success('Image URL copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy URL');
      });
  };

  const generateVariation = () => {
    if (!prompt.trim()) return;
    
    // Unlock seed and generate new random seed for variation
    setLockSeed(false);
    handleGenerate();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full relative">
        {/* Compact Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
          {/* Prompt Input - Compact */}
          <div>
            <Label className="text-white/80 text-sm mb-1 block">
              Describe your image
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="a neon fox, cinematic..."
              className="min-h-[80px] max-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-vertical focus:bg-white/15 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>

          {/* Compact Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-white/80 text-xs mb-1 block">Model</Label>
              <Select value={imageModel} onValueChange={setImageModel}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flux">flux</SelectItem>
                  <SelectItem value="turbo">turbo</SelectItem>
                  <SelectItem value="stability">stability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/80 text-xs mb-1 block">Size</Label>
              <Select value={aspectRatio} onValueChange={(value: AspectRatio) => setAspectRatio(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">Square</SelectItem>
                  <SelectItem value="3:4">Portrait</SelectItem>
                  <SelectItem value="4:3">Landscape</SelectItem>
                  <SelectItem value="9:16">Mobile</SelectItem>
                  <SelectItem value="16:9">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compact Options */}
          <div className="flex gap-3 text-xs flex-wrap">
            <div className="flex items-center space-x-1">
              <Checkbox
                id="enhance-mobile"
                checked={enhance}
                onCheckedChange={(checked) => setEnhance(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="enhance-mobile" className="text-white/80">Enhance</Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox
                id="safe-mobile"
                checked={safe}
                onCheckedChange={(checked) => setSafe(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="safe-mobile" className="text-white/80">Safe</Label>
            </div>
          </div>

          {/* Image Preview - Mobile */}
          <div className="aspect-square rounded-xl bg-black/30 border border-white/10 overflow-hidden relative">
            {!currentImageUrl ? (
              <div className="h-full flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tap Generate to create</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full group">
                {!loadError ? (
                  <Image
                    src={currentImageUrl}
                    alt="Generated image"
                    fill
                    className="object-cover"
                    onError={() => setLoadError(true)}
                    onLoad={() => setLoadError(false)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-white/60">
                    <p className="text-sm">Failed to load image</p>
                  </div>
                )}
                
                {/* Mobile Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsFullscreen(true)}
                    className="bg-white/20 text-white h-8 px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={downloadImage}
                    className="bg-white/20 text-white h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Generate Button at Bottom - Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium h-12 text-base rounded-xl"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Prompt Input */}
          <div>
            <Label className="text-white/80 text-sm mb-2 block">
              Describe your image
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="a neon fox, cinematic, rim light, 85mm..."
              className="min-h-[120px] max-h-[300px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-vertical focus:bg-white/15"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>

          {/* Desktop Controls */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-white/80 text-xs mb-1 block">Model</Label>
              <Select value={imageModel} onValueChange={setImageModel}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flux">flux</SelectItem>
                  <SelectItem value="turbo">turbo</SelectItem>
                  <SelectItem value="stability">stability</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/80 text-xs mb-1 block">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value: AspectRatio) => setAspectRatio(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                  <SelectItem value="3:4">3:4 Portrait</SelectItem>
                  <SelectItem value="4:3">4:3 Landscape</SelectItem>
                  <SelectItem value="9:16">9:16 Mobile</SelectItem>
                  <SelectItem value="16:9">16:9 Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/80 text-xs mb-1 block">Seed</Label>
              <div className="flex gap-1">
                <Input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="random"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLockSeed(!lockSeed)}
                  className="h-9 w-9 p-0 bg-white/10 border border-white/20 hover:bg-white/20"
                >
                  {lockSeed ? (
                    <Lock className="h-3 w-3 text-yellow-400" />
                  ) : (
                    <Unlock className="h-3 w-3 text-white/70" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Options */}
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enhance"
                checked={enhance}
                onCheckedChange={(checked) => setEnhance(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="enhance" className="text-white/80">Enhance quality</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="safe"
                checked={safe}
                onCheckedChange={(checked) => setSafe(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="safe" className="text-white/80">Safe mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nologo"
                checked={nologo}
                onCheckedChange={(checked) => setNologo(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="nologo" className="text-white/80">Remove logo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                className="border-white/30 data-[state=checked]:bg-violet-600"
              />
              <Label htmlFor="private" className="text-white/80">Private generation</Label>
            </div>
          </div>

          {/* Desktop Generate Button */}
          <div>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* Desktop Image Preview */}
          <div className="flex-1 min-h-[200px] rounded-2xl bg-black/30 border border-white/10 overflow-hidden relative">
            {!currentImageUrl ? (
              <div className="h-full flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a prompt and click Generate Image</p>
                  <p className="text-sm opacity-75 mt-2">Images will appear here</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full group">
                {!loadError ? (
                  <Image
                    src={currentImageUrl}
                    alt="Generated image"
                    fill
                    className="object-contain cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                    onError={() => setLoadError(true)}
                    onLoad={() => setLoadError(false)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-white/60">
                    <p>Failed to load image. Please try again.</p>
                  </div>
                )}
                
                {/* Desktop Action Buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsFullscreen(true)}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyImageUrl}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={downloadImage}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={generateVariation}
                    className="bg-black/50 text-white hover:bg-black/70"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && currentImageUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={currentImageUrl}
                alt="Generated image fullscreen"
                fill
                className="object-contain"
                onError={() => setLoadError(true)}
                onLoad={() => setLoadError(false)}
              />
            </div>
            
            {/* Fullscreen Action Buttons */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <Button
                variant="ghost"
                onClick={copyImageUrl}
                className="bg-black/50 border border-white/20 text-white hover:bg-black/70"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              
              <Button
                variant="ghost"
                onClick={downloadImage}
                className="bg-black/50 border border-white/20 text-white hover:bg-black/70"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                variant="ghost"
                onClick={generateVariation}
                className="bg-black/50 border border-white/20 text-white hover:bg-black/70"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Variation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
