// components/ImageStudio-fixed.tsx
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
import { cn } from '@/lib/utils';
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when fullscreen
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setLoadError(false);

    // Generate new seed if not locked
    const currentSeed = lockSeed ? seed : Math.floor(Math.random() * 1000000).toString();
    if (!lockSeed) {
      setSeed(currentSeed);
    }

    const url = imageUrl({
      prompt,
      model: imageModel,
      width,
      height,
      seed: currentSeed,
      nologo,
      enhance,
      safe,
      private: isPrivate
    });

    setCurrentImageUrl(url);

    const imageData = {
      id: uuidv4(),
      prompt,
      url,
      params: {
        model: imageModel,
        width,
        height,
        seed: currentSeed,
        nologo,
        enhance,
        safe,
        private: isPrivate
      },
      timestamp: Date.now()
    };

    addGeneratedImage(imageData);
  };

  const handleImageLoad = () => {
    setIsGenerating(false);
    setLoadError(false);
  };

  const handleImageError = () => {
    setIsGenerating(false);
    setLoadError(true);
  };

  const copyImageUrl = () => {
    if (currentImageUrl) {
      navigator.clipboard.writeText(currentImageUrl);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const downloadImage = async () => {
    if (currentImageUrl) {
      try {
        // Fetch the image as a blob to avoid opening in fullscreen
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        
        // Create a URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
        
        toast.success('Image downloaded successfully!');
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Failed to download image');
      }
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const generateVariation = () => {
    if (currentImageUrl) {
      handleGenerate();
    }
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prompt Input */}
        <div className="flex-shrink-0">
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

        {/* Controls Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-shrink-0">
          {/* Model Select */}
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

          {/* Aspect Ratio */}
          <div>
            <Label className="text-white/80 text-xs mb-1 block">Ratio</Label>
            <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(ASPECT_RATIOS).map((ratio) => (
                  <SelectItem key={ratio} value={ratio}>
                    {ratio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seed Input */}
          <div className="relative">
            <Label className="text-white/80 text-xs mb-1 block">Seed</Label>
            <div className="flex gap-1">
              <Input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="random"
                className="bg-white/10 border-white/20 text-white h-9 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLockSeed(!lockSeed)}
                className="h-9 w-9 bg-white/10 border-white/20 hover:bg-white/20 flex-shrink-0"
              >
                {lockSeed ? <Lock className="h-3 w-3 text-white" /> : <Unlock className="h-3 w-3 text-white" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={randomizeSeed}
                className="h-9 w-9 bg-white/10 border-white/20 hover:bg-white/20 flex-shrink-0"
                title="Random seed"
              >
                <Shuffle className="h-3 w-3 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="nologo"
              checked={nologo}
              onCheckedChange={(checked) => setNologo(checked as boolean)}
            />
            <Label htmlFor="nologo" className="text-white/80 text-sm">
              No Logo
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enhance"
              checked={enhance}
              onCheckedChange={(checked) => setEnhance(checked as boolean)}
            />
            <Label htmlFor="enhance" className="text-white/80 text-sm">
              Enhance
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="safe"
              checked={safe}
              onCheckedChange={(checked) => setSafe(checked as boolean)}
            />
            <Label htmlFor="safe" className="text-white/80 text-sm">
              Safe Mode
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <Label htmlFor="private" className="text-white/80 text-sm">
              Private
            </Label>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-12 flex-shrink-0 w-full"
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

      {/* Image Preview */}
      <div className="flex-1 min-h-[200px] m-4 mt-0 rounded-2xl bg-black/30 border border-white/10 overflow-hidden relative flex flex-col">
        {!currentImageUrl ? (
          <div className="h-full flex items-center justify-center text-white/60">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Enter a prompt and click Generate Image</p>
              <p className="text-sm mt-1">⌘/Ctrl + Enter to generate</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {isGenerating && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Generating your image...</p>
                </div>
              </div>
            )}
            
            {loadError ? (
              <div className="h-full flex items-center justify-center text-white/60">
                <div className="text-center">
                  <p>Failed to load image</p>
                  <Button
                    variant="ghost"
                    onClick={handleGenerate}
                    className="mt-2 text-white/70 hover:text-white"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <Image
                  src={currentImageUrl}
                  alt={prompt}
                  width={width}
                  height={height}
                  className="w-full h-auto object-contain rounded-xl"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  unoptimized
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom when image exists */}
      {currentImageUrl && !isGenerating && !loadError && (
        <div className="flex gap-2 p-4 pt-0">
          <Button
            variant="ghost"
            onClick={copyImageUrl}
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
          
          <Button
            variant="ghost"
            onClick={downloadImage}
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button
            variant="ghost"
            onClick={openFullscreen}
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Eye className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
          
          <Button
            variant="ghost"
            onClick={generateVariation}
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Variation
          </Button>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && currentImageUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Fullscreen Image */}
            <div className="flex-1 flex items-center justify-center">
              <Image
                src={currentImageUrl}
                alt={prompt}
                width={width}
                height={height}
                className="max-w-full max-h-full object-contain rounded-xl"
                unoptimized
              />
            </div>
            
            {/* Fullscreen Action Buttons */}
            <div className="flex gap-3 mt-4 justify-center">
              <Button
                variant="ghost"
                onClick={copyImageUrl}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              
              <Button
                variant="ghost"
                onClick={downloadImage}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                variant="ghost"
                onClick={generateVariation}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
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
