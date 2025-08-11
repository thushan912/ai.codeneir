// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from './pollinations';

export interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Chat state
  chatModel: string;
  setChatModel: (model: string) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  
  // Image state
  imageModel: string;
  setImageModel: (model: string) => void;
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  setAspectRatio: (ratio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9') => void;
  seed: string;
  setSeed: (seed: string) => void;
  lockSeed: boolean;
  setLockSeed: (lock: boolean) => void;
  nologo: boolean;
  setNologo: (nologo: boolean) => void;
  enhance: boolean;
  setEnhance: (enhance: boolean) => void;
  safe: boolean;
  setSafe: (safe: boolean) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  
  // UI state
  activeTab: 'chat' | 'create';
  setActiveTab: (tab: 'chat' | 'create') => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
  
  // Generated images
  generatedImages: Array<{
    id: string;
    prompt: string;
    url: string;
    params: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    timestamp: number;
  }>;
  addGeneratedImage: (image: {
    id: string;
    prompt: string;
    url: string;
    params: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    timestamp: number;
  }) => void;
  
  // Clear functions
  clearChat: () => void;
  clearImages: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      // Chat state
      chatModel: 'mistral',
      setChatModel: (chatModel) => set({ chatModel }),
      chatMessages: [
        { role: 'system', content: 'You are a helpful creative assistant.', id: 'system' }
      ],
      setChatMessages: (chatMessages) => set({ chatMessages }),
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      streamingContent: '',
      setStreamingContent: (streamingContent) => set({ streamingContent }),
      
      // Image state
      imageModel: 'flux',
      setImageModel: (imageModel) => set({ imageModel }),
      aspectRatio: '1:1',
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),
      seed: 'random',
      setSeed: (seed) => set({ seed }),
      lockSeed: false,
      setLockSeed: (lockSeed) => set({ lockSeed }),
      nologo: true,
      setNologo: (nologo) => set({ nologo }),
      enhance: false,
      setEnhance: (enhance) => set({ enhance }),
      safe: false,
      setSafe: (safe) => set({ safe }),
      isPrivate: false,
      setIsPrivate: (isPrivate) => set({ isPrivate }),
      
      // UI state
      activeTab: 'chat',
      setActiveTab: (activeTab) => set({ activeTab }),
      isMobile: false,
      setIsMobile: (isMobile) => set({ isMobile }),
      
      // Generated images
      generatedImages: [],
      addGeneratedImage: (image) => set((state) => ({
        generatedImages: [image, ...state.generatedImages]
      })),
      
      // Clear functions
      clearChat: () => set({
        chatMessages: [
          { role: 'system', content: 'You are a helpful creative assistant.', id: 'system' }
        ],
        streamingContent: '',
        isStreaming: false
      }),
      clearImages: () => set({ generatedImages: [] })
    }),
    {
      name: 'chat-create-storage',
      partialize: (state) => ({
        theme: state.theme,
        chatModel: state.chatModel,
        imageModel: state.imageModel,
        aspectRatio: state.aspectRatio,
        seed: state.seed,
        lockSeed: state.lockSeed,
        nologo: state.nologo,
        enhance: state.enhance,
        safe: state.safe,
        isPrivate: state.isPrivate,
        generatedImages: state.generatedImages.slice(0, 20) // Keep only last 20 images
      })
    }
  )
);
