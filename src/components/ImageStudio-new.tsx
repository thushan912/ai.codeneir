// components/ImageStudio.tsx
'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Download, Copy, Shuffle, Lock, Unlock, Loader2, Sparkles } from 'lucide-react';
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

  const { width, height } = useMemo(() => {
    return ASPECT_RATIOS[aspectRatio];
  }, [aspectRatio]);

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
      prompt: prompt.trim(),
      model: imageModel,
      width,
      height,
      seed: currentSeed,
      nologo,
      enhance,
      safe,
      private: isPrivate,
      referrer: 'chat-create'
    });

    setCurrentImageUrl(url);

    // Add to generated images
    const imageData = {
      id: uuidv4(),
      prompt: prompt.trim(),
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
    }
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
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Prompt Input */}
      <div>
        <Label className="text-white/80 text-sm mb-2 block">
          Describe your image
        </Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="a neon fox, cinematic, rim light, 85mm..."
          className="min-h-[96px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none focus:bg-white/15"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-sm"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={lockSeed ? randomizeSeed : () => setLockSeed(true)}
              className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10"
            >
              {lockSeed ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="nologo"
            checked={nologo}
            onCheckedChange={(checked) => setNologo(checked as boolean)}
          />
          <Label htmlFor="nologo" className="text-white/80 text-sm">
            No logo
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
            Safe mode
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
        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-12"
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

      {/* Image Preview */}
      <div className="flex-1 min-h-[300px] rounded-2xl bg-black/30 border border-white/10 overflow-hidden relative">
        {!currentImageUrl ? (
          <div className="h-full flex items-center justify-center text-white/60">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Enter a prompt and click Generate Image</p>
              <p className="text-sm mt-1">⌘/Ctrl + Enter to generate</p>
            </div>
          </div>
        ) : (
          <>
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
              <Image
                src={currentImageUrl}
                alt={prompt}
                width={width}
                height={height}
                className="w-full h-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized
              />
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      {currentImageUrl && !isGenerating && !loadError && (
        <div className="flex gap-2">
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
            onClick={() => {
              const link = document.createElement('a');
              link.href = currentImageUrl;
              link.download = `generated-image-${Date.now()}.png`;
              link.click();
            }}
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
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
    </div>
  );
}
