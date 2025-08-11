// lib/pollinations.ts
export type ChatMessage = { 
  role: 'system' | 'user' | 'assistant'; 
  content: string;
  id?: string;
};

export interface TextGenerationOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  signal?: AbortSignal;
}

export interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: string | number;
  nologo?: boolean;
  enhance?: boolean;
  safe?: boolean;
  private?: boolean;
  referrer?: string;
}

export async function pollinateText({ model, messages, stream, signal }: TextGenerationOptions) {
  try {
    // Get the last user message
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Try the simple text endpoint first
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain',
      },
      body: userMessage,
      signal
    });
    
    if (!res.ok) {
      throw new Error(`Pollinations API error: ${res.status} - Service temporarily unavailable`);
    }
    
    const responseText = await res.text();
    
    if (stream) {
      // For streaming, create a simple readable stream
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        start(controller) {
          const words = responseText.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const chunk = `data: ${JSON.stringify({
                choices: [{
                  delta: { content: words[i] + ' ' }
                }]
              })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
              i++;
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              clearInterval(interval);
            }
          }, 50);
        }
      });
      return readable;
    } else {
      // For non-streaming, return in OpenAI format
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: responseText
          }
        }],
        model: model || 'openai',
        created: Date.now()
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Pollinations API. Please check your internet connection.');
      }
    }
    console.error('Pollinations API error:', error);
    throw error;
  }
}

export function imageUrl({
  prompt,
  model = 'flux',
  width = 1024,
  height = 1024,
  seed = 'random',
  nologo = false,
  enhance = false,
  safe = false,
  private: isPrivate = false,
  referrer = 'chat-create'
}: ImageGenerationOptions) {
  const base = 'https://image.pollinations.ai/prompt/';
  const p = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    model,
    width: String(width),
    height: String(height),
    seed: String(seed),
    referrer
  });
  
  if (nologo) params.set('nologo', 'true');
  if (enhance) params.set('enhance', 'true');
  if (safe) params.set('safe', 'true');
  if (isPrivate) params.set('private', 'true');
  
  return `${base}${p}?${params.toString()}`;
}

export async function fetchModels(type: 'text' | 'image' = 'text') {
  try {
    // Use known working models - Pollinations API endpoints may have changed
    // Return the current supported models directly
    const fallbackModels = type === 'text' 
      ? ['mistral', 'llama-3.1-8b', 'gemma-2-9b-it', 'claude-3-haiku', 'gpt-4']
      : ['flux', 'turbo', 'stability', 'flux-realism', 'flux-3d'];
    
    // Optionally try to fetch if endpoints are available
    try {
      const endpoint = type === 'text' 
        ? 'https://text.pollinations.ai/models'
        : 'https://image.pollinations.ai/models';
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle different response formats
        if (Array.isArray(data)) {
          const models = data.map((item: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
            typeof item === 'string' ? item : 
            typeof item === 'object' ? (item.name || item.id || item.model || String(item)) :
            String(item)
          ).filter(Boolean);
          
          return models.length > 0 ? models : fallbackModels;
        }
        
        // If response is an object with models property
        if (data && typeof data === 'object' && data.models) {
          const models = Array.isArray(data.models) ? data.models.map((item: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
            typeof item === 'string' ? item : 
            typeof item === 'object' ? (item.name || item.id || item.model || String(item)) :
            String(item)
          ).filter(Boolean) : [];
          
          return models.length > 0 ? models : fallbackModels;
        }
      }
    } catch (fetchError) {
      console.warn(`Failed to fetch ${type} models from API, using fallback:`, fetchError);
    }
    
    return fallbackModels;
  } catch (error) {
    console.error(`Error fetching ${type} models:`, error);
    // Return fallback models
    return type === 'text' 
      ? ['mistral', 'llama-3.1-8b', 'gemma-2-9b-it', 'claude-3-haiku', 'gpt-4']
      : ['flux', 'turbo', 'stability', 'flux-realism', 'flux-3d'];
  }
}

export const ASPECT_RATIOS = {
  '1:1': { width: 1024, height: 1024 },
  '3:4': { width: 768, height: 1024 },
  '4:3': { width: 1024, height: 768 },
  '9:16': { width: 768, height: 1365 },
  '16:9': { width: 1365, height: 768 }
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIOS;
