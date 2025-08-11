// components/ChatPanel.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Copy, RotateCcw, Upload, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { pollinateText, type ChatMessage } from '@/lib/pollinations';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function ChatPanel() {
  const {
    chatMessages,
    setChatMessages,
    chatModel,
    isStreaming,
    setIsStreaming,
    streamingContent,
    setStreamingContent
  } = useAppStore();

  const [input, setInput] = useState('');
  const [streamMode, setStreamMode] = useState(true);
  const [safeMode, setSafeMode] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful creative assistant.');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      id: uuidv4()
    };

    // Update system prompt if changed
    const updatedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt, id: 'system' } as ChatMessage,
      ...chatMessages.filter(m => m.role !== 'system'),
      userMessage
    ];

    setChatMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    abortRef.current = new AbortController();

    try {
      if (streamMode) {
        // Use the pollinateText function for better error handling
        const stream = await pollinateText({
          model: chatModel,
          messages: updatedMessages.map(({ id: _, ...msg }) => msg) as ChatMessage[],
          stream: true,
          signal: abortRef.current.signal
        });

        if (!stream) {
          throw new Error('Failed to get stream from API');
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // Handle Server-Sent Events format
          const lines = chunk.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6).trim();
              
              // Skip empty lines and [DONE] marker
              if (!data || data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                // Extract content from OpenAI-style response
                if (parsed.choices?.[0]?.delta?.content) {
                  assistantContent += parsed.choices[0].delta.content;
                } else if (parsed.choices?.[0]?.message?.content) {
                  // Handle non-streaming response format
                  assistantContent += parsed.choices[0].message.content;
                }
              } catch (error) {
                // If it's not valid JSON, it might be plain text content
                // But only if it doesn't look like a JSON object
                if (!data.startsWith('{') && !data.includes('"choices"')) {
                  console.warn('Including non-JSON streaming data:', data);
                  assistantContent += data;
                } else {
                  console.warn('Failed to parse streaming JSON:', data);
                }
              }
            }
            // Ignore any other lines that might contain raw JSON or metadata
          }

          setStreamingContent(assistantContent);
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: assistantContent.trim(),
          id: uuidv4()
        };

        setChatMessages([...updatedMessages, assistantMessage]);
      } else {
        // Non-streaming mode
        const result = await pollinateText({
          model: chatModel,
          messages: updatedMessages.map(({ id: _, ...msg }) => msg) as ChatMessage[],
          stream: false,
          signal: abortRef.current.signal
        });

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: result.choices?.[0]?.message?.content || 'No response received.',
          id: uuidv4()
        };

        setChatMessages([...updatedMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error && error.message.includes('Pollinations API') 
          ? `Sorry, the AI service is temporarily unavailable. Error: ${error.message}\n\nPlease try again in a few moments.`
          : 'Sorry, something went wrong. Please check your internet connection and try again.',
        id: uuidv4()
      };
      setChatMessages([...updatedMessages, errorMessage]);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const regenerateMessage = async (messageIndex: number) => {
    if (isStreaming) return;

    const messagesToKeep = chatMessages.slice(0, messageIndex);
    setChatMessages(messagesToKeep);

    // Resend the last user message
    const lastUserMessage = messagesToKeep.findLast(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setTimeout(() => handleSend(), 100);
    }
  };

  const displayMessages = chatMessages.filter(m => m.role !== 'system');

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Settings Panel */}
      {showSystemPrompt && (
        <div className="p-3 border-b border-white/10 bg-black/20 flex-shrink-0">
          <Label className="text-white/80 text-sm">System Prompt</Label>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="mt-1 bg-white/10 border-white/20 text-white resize-none"
            rows={2}
            placeholder="Define the assistant's behavior..."
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 p-4">
        {displayMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/50">
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <p>Start a conversation...</p>
              <p className="text-sm mt-1">Ask me anything!</p>
            </div>
          </div>
        )}
        
        {displayMessages.map((message, index) => (
          <div
            key={message.id || index}
            className={cn(
              "group flex gap-3 max-w-[90%] animate-fade-in",
              message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1",
              message.role === 'user' 
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
                : "bg-white/10 text-white/70 border border-white/20"
            )}>
              {message.role === 'user' ? "You" : "AI"}
            </div>
            
            {/* Message Content */}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 shadow-xl relative flex-1 min-w-0",
                message.role === 'user'
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                  : "bg-white/5 border border-white/10 text-white backdrop-blur-sm"
              )}
            >
              <div className="whitespace-pre-wrap break-words word-break leading-relaxed overflow-wrap-anywhere">
                {message.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-white/90">{children}</em>,
                        code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-violet-300 text-sm">{children}</code>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
              
              {/* Timestamp */}
              <div className={cn(
                "text-xs mt-2 opacity-60",
                message.role === 'user' ? "text-white/70" : "text-white/50"
              )}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {message.role === 'assistant' && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white"
                    onClick={() => copyMessage(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white/70 hover:text-white"
                    onClick={() => regenerateMessage(index + 1)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <div className="group flex gap-3 max-w-[90%] animate-fade-in">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1 bg-white/10 text-white/70 border border-white/20">
              AI
            </div>
            
            {/* Message Content */}
            <div className="rounded-2xl px-4 py-3 shadow-xl bg-white/5 border border-white/10 text-white backdrop-blur-sm flex-1 min-w-0">
              <div className="whitespace-pre-wrap break-words word-break leading-relaxed overflow-wrap-anywhere">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                      em: ({ children }) => <em className="italic text-white/90">{children}</em>,
                      code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-violet-300 text-sm">{children}</code>,
                      ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
                    }}
                  >
                    {streamingContent}
                  </ReactMarkdown>
                </div>
                <span className="inline-block w-2 h-5 bg-violet-400 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingContent && (
          <div className="group flex gap-3 max-w-[90%] animate-fade-in">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1 bg-white/10 text-white/70 border border-white/20">
              AI
            </div>
            
            {/* Message Content */}
            <div className="rounded-2xl px-4 py-3 shadow-xl bg-white/5 border border-white/10 text-white backdrop-blur-sm flex-1">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-white/70">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm space-y-3 flex-shrink-0">
        {/* Controls */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stream"
              checked={streamMode}
              onCheckedChange={(checked) => setStreamMode(checked as boolean)}
            />
            <Label htmlFor="stream" className="text-white/80">Stream responses</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="safe"
              checked={safeMode}
              onCheckedChange={(checked) => setSafeMode(checked as boolean)}
            />
            <Label htmlFor="safe" className="text-white/80">Safe mode</Label>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="text-white/70 hover:text-white hover:bg-white/10 h-8"
          >
            <Settings className="h-3 w-3 mr-1" />
            System prompt
          </Button>
        </div>

        {/* Input */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
              className="min-h-[52px] max-h-32 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none focus:bg-white/15 focus:border-white/30"
              disabled={isStreaming}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 rounded-xl"
              title="Upload image"
            >
              <Upload className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-12 w-12 rounded-xl"
              size="icon"
              title="Send message"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
