"use client";

import { useState } from "react";
import { Mic2, FileAudio, ArrowLeft, Sparkles, Send, X, Bot, User } from "lucide-react";
import Link from "next/link";
import { ChordRenderer } from "./ChordRenderer";
import { UtilityToolbar } from "./UtilityToolbar";
import { useEffect, useRef } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  contributor_username: string;
  chord_data: string;
}

export function SongViewer({ song }: { song: Song }) {
  const [transposeBy, setTransposeBy] = useState(0);
  const [simplify, setSimplify] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id, question: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.answer || "Sorry, I couldn't understand that." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Failed to connect to assistant." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 pt-8 lg:max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{song.title}</h1>
              <div className="flex items-center gap-3 text-xl text-muted-foreground">
                <Mic2 className="h-5 w-5" />
                <span>{song.artist}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md w-fit font-medium">
                <FileAudio className="h-4 w-4" />
                {song.genre}
              </span>
              <span>Contributed by <strong>@{song.contributor_username}</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-white/5 rounded-2xl p-6 md:p-8 lg:p-12 shadow-inner">
          <ChordRenderer 
            content={song.chord_data} 
            transposeBy={transposeBy} 
            simplify={simplify} 
          />
        </div>
      </div>

      <UtilityToolbar 
        transposeBy={transposeBy}
        setTransposeBy={setTransposeBy}
        simplify={simplify}
        setSimplify={setSimplify}
      />

      {/* Floating Ask AI Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-primary to-emerald-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
        title="Ask Question about chords"
      >
        <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[500px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl z-40 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Ask AI Assistant</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{song.title}</span>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground/50">
                <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Ask anything about this song!</p>
                <p className="text-xs mt-1">&quot;What scale is this?&quot; or &quot;Show chords&quot;</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && <Bot className="h-6 w-6 text-primary mt-1 shrink-0 bg-primary/10 p-1 rounded" />}
                <div className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 rounded-tl-none text-foreground/90'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <Bot className="h-6 w-6 text-primary mt-1 shrink-0 bg-primary/10 p-1 rounded" />
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none animate-pulse">
                  <div className="flex gap-1.5">
                    <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                    <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-white/5 bg-white/3 flex gap-2">
            <input 
              type="text" 
              placeholder="Type your question..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage} 
              className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
