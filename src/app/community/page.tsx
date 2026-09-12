"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Video,
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Plus,
  Send,
  Sparkles,
  Music2,
  UserPlus,
  Check,
  X,
  Play,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  description: string;
  video_url: string;
  video_type: string;
  song_tag: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  channel: string;
  sender_name: string;
  sender_avatar: string;
  text: string;
  created_at: string;
}

const ARTISTS = [
  {
    id: "user-jimi",
    name: "JimiHendrix99",
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
    role: "Lead Guitarist",
    bio: "Classic rock, thumb-over blues, and Stratocaster tones.",
    followers: 1240,
    tags: ["Blues", "Electric", "Rock"],
  },
  {
    id: "user-maya",
    name: "MayaChords",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    role: "Acoustic & Vocalist",
    bio: "Fingerstyle arranger and acoustic chord melody enthusiast.",
    followers: 890,
    tags: ["Acoustic", "Fingerstyle", "Pop"],
  },
  {
    id: "user-leo",
    name: "AcousticFingerstyle",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    role: "Percussive Fingerstyle",
    bio: "Drop tunings, percussive guitar taps, and Andy McKee style.",
    followers: 2150,
    tags: ["DADGAD", "Percussive", "Modern"],
  },
  {
    id: "user-rohan",
    name: "RohanSharmaGuitar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    role: "Composer & Guitarist",
    bio: "Bollywood chord tabs, jazz fusion, and neo-soul licks.",
    followers: 1780,
    tags: ["Bollywood", "Fusion", "Neo-Soul"],
  },
];

function getEmbedVideoUrl(url: string): string {
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"videos" | "artists" | "chat">("videos");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newSongTag, setNewSongTag] = useState("");
  const [uploading, setUploading] = useState(false);

  // Chat State
  const [chatChannel, setChatChannel] = useState("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Connected Artists state
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  // Fetch Posts
  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/community/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to load posts", err);
      }
    }
    loadPosts();
  }, []);

  // Fetch Chat Messages
  useEffect(() => {
    async function loadChat() {
      try {
        const res = await fetch(`/api/community/chat?channel=${chatChannel}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat", err);
      }
    }
    loadChat();
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [chatChannel]);

  const handleLike = async (postId: string) => {
    const wasLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !wasLiked }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + (wasLiked ? -1 : 1) } : p))
    );

    try {
      await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: session?.user?.name || "guest-user" }),
      });
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVideoUrl.trim()) return;

    setUploading(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          video_url: newVideoUrl,
          song_tag: newSongTag,
          author_name: session?.user?.name || "Musician",
          author_avatar: (session?.user as any)?.image,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.post) {
          setPosts((prev) => [json.post, ...prev]);
        }
        setShowUploadModal(false);
        setNewTitle("");
        setNewDesc("");
        setNewVideoUrl("");
        setNewSongTag("");
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput;
    setChatInput("");

    try {
      const res = await fetch("/api/community/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: chatChannel,
          sender_name: session?.user?.name || "Musician",
          sender_avatar: (session?.user as any)?.image,
          text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.message) {
          setMessages((prev) => [...prev, json.message]);
        }
      }
    } catch (err) {
      console.error("Chat send failed", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1060 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--f-display)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              Musician <span style={{ color: "var(--amber)" }}>Community & Shots</span>
            </h1>
            <p style={{ fontSize: 15, color: "var(--t3)", margin: 0 }}>
              Share your guitar covers, connect with fellow artists, and jam together.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              borderRadius: 30,
              background: "var(--amber)",
              color: "#000",
              fontWeight: 800,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(245, 166, 35, 0.4)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Upload size={16} /> Upload Video / Shot
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: 8,
            borderBottom: "1px solid var(--border)",
            paddingBottom: 14,
            marginBottom: 32,
          }}
        >
          {[
            { id: "videos", label: "Video Shots Feed", icon: Video },
            { id: "artists", label: "Discover Artists", icon: Users },
            { id: "chat", label: "Live Jam Room", icon: MessageCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                background: activeTab === id ? "rgba(245, 166, 35, 0.12)" : "transparent",
                color: activeTab === id ? "var(--amber)" : "var(--t3)",
                border: `1px solid ${activeTab === id ? "rgba(245, 166, 35, 0.3)" : "transparent"}`,
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: VIDEO SHOTS FEED ─── */}
        {activeTab === "videos" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
            {posts.map((post) => {
              const isLiked = likedPosts[post.id];
              const embedUrl = getEmbedVideoUrl(post.video_url);

              return (
                <div
                  key={post.id}
                  style={{
                    background: "rgba(18, 18, 24, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  {/* Video Player */}
                  <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
                    <iframe
                      src={embedUrl}
                      title={post.title}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Post Details */}
                  <div style={{ padding: 20 }}>
                    {/* Author Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "block" }}>
                          {post.author_name}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--t4)" }}>Guitarist</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
                      {post.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5, marginBottom: 14 }}>
                      {post.description}
                    </p>

                    {/* Tagged Song */}
                    {post.song_tag && (
                      <div style={{ marginBottom: 16 }}>
                        <Link
                          href={`/explore?q=${encodeURIComponent(post.song_tag)}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "rgba(245, 166, 35, 0.08)",
                            border: "1px solid rgba(245, 166, 35, 0.2)",
                            color: "var(--amber)",
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          <Music2 size={12} /> Play along: {post.song_tag}
                        </Link>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "transparent",
                          border: "none",
                          color: isLiked ? "#ff4d4f" : "var(--t3)",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        <Heart size={16} fill={isLiked ? "#ff4d4f" : "none"} /> {post.likes_count}
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--t3)", fontSize: 13, fontWeight: 700 }}>
                        <MessageCircle size={16} /> {post.comments_count} comments
                      </div>

                      <button
                        onClick={() => navigator.share?.({ title: post.title, url: window.location.href }).catch(() => {})}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--t3)",
                          cursor: "pointer",
                        }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB 2: ARTISTS DIRECTORY ─── */}
        {activeTab === "artists" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {ARTISTS.map((artist) => {
              const isConn = connected[artist.id];
              return (
                <div
                  key={artist.id}
                  style={{
                    background: "rgba(18, 18, 24, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 20,
                    padding: 24,
                    textAlign: "center",
                  }}
                >
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 14px auto",
                      border: "2px solid var(--amber)",
                    }}
                  />
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px 0" }}>{artist.name}</h3>
                  <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 700, display: "block", marginBottom: 10 }}>
                    {artist.role}
                  </span>
                  <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5, marginBottom: 16 }}>
                    {artist.bio}
                  </p>

                  <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                    {artist.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "var(--t3)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setConnected((c) => ({ ...c, [artist.id]: !isConn }))}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 12,
                      background: isConn ? "rgba(255, 255, 255, 0.1)" : "var(--amber)",
                      color: isConn ? "#fff" : "#000",
                      fontWeight: 800,
                      fontSize: 13,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {isConn ? (
                      <>
                        <Check size={14} /> Connected
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Connect
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB 3: LIVE JAM ROOM CHAT ─── */}
        {activeTab === "chat" && (
          <div
            style={{
              background: "rgba(18, 18, 24, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              height: 580,
            }}
          >
            {/* Channels Sidebar */}
            <div style={{ background: "rgba(12, 12, 16, 0.95)", borderRight: "1px solid var(--border)", padding: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t4)", display: "block", marginBottom: 14 }}>
                Jam Channels
              </span>

              {[
                { id: "general", label: "# general-jam" },
                { id: "gear", label: "# guitar-gear" },
                { id: "critique", label: "# songwriting-critique" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChatChannel(ch.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: chatChannel === ch.id ? "rgba(245, 166, 35, 0.15)" : "transparent",
                    color: chatChannel === ch.id ? "var(--amber)" : "var(--t3)",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    marginBottom: 4,
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Chat Messages + Input */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Messages Scroll Area */}
              <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ display: "flex", gap: 12 }}>
                    <img
                      src={m.sender_avatar}
                      alt={m.sender_name}
                      style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{m.sender_name}</span>
                        <span style={{ fontSize: 11, color: "var(--t4)" }}>{m.created_at.slice(11, 16)}</span>
                      </div>
                      <p style={{ fontSize: 13.5, color: "var(--t2)", margin: 0, lineHeight: 1.4 }}>{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: 16,
                  borderTop: "1px solid var(--border)",
                  background: "rgba(14, 14, 18, 0.9)",
                }}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message #${chatChannel}...`}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0 20px",
                    borderRadius: 12,
                    background: "var(--amber)",
                    color: "#000",
                    border: "none",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── UPLOAD VIDEO MODAL ─── */}
        <AnimatePresence>
          {showUploadModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <div
                style={{ position: "absolute", inset: 0, background: "rgba(5, 5, 8, 0.8)", backdropFilter: "blur(14px)" }}
                onClick={() => setShowUploadModal(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 480,
                  background: "rgba(18, 18, 24, 0.98)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 24,
                  padding: 32,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Upload Video / Shot</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    style={{ background: "transparent", border: "none", color: "var(--t3)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", marginBottom: 6 }}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Little Wing Acoustic Solo"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: 13.5,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", marginBottom: 6 }}>
                      Video URL (YouTube, Vimeo, MP4)
                    </label>
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: 13.5,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", marginBottom: 6 }}>
                      Tag Song (from GeetHub)
                    </label>
                    <input
                      type="text"
                      value={newSongTag}
                      onChange={(e) => setNewSongTag(e.target.value)}
                      placeholder="e.g. Hotel California"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: 13.5,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase", marginBottom: 6 }}>
                      Description
                    </label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Share your guitar gear, tuning, and technique tips..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        fontSize: 13.5,
                        outline: "none",
                        boxSizing: "border-box",
                        resize: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      marginTop: 8,
                      padding: "12px",
                      borderRadius: 12,
                      background: "var(--amber)",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: 14,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {uploading ? "Publishing..." : "Publish Shot"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
