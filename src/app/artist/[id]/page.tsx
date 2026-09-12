"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Video, Music, Check, UserPlus, Heart, Sparkles } from "lucide-react";
import { useState } from "react";

const ARTIST_PROFILES: Record<string, any> = {
  "user-jimi": {
    name: "JimiHendrix99",
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
    role: "Lead & Rhythm Guitarist",
    bio: "Classic rock, thumb-over blues, and Stratocaster tones. Obsessed with Hendrix chords (7#9) and Little Wing embellishments.",
    location: "London, UK",
    followers: 1240,
    gear: ["Fender Stratocaster '62", "Marshall Plexi 1959", "Ibanez Tube Screamer TS808"],
    videos: [
      { id: "v1", title: "Little Wing Intro Solo breakdown + tabs", url: "https://www.youtube.com/watch?v=sO_4y8n0N_8", likes: 142 },
      { id: "v2", title: "Voodoo Child Wah Groove", url: "https://www.youtube.com/watch?v=qFkngJ7p92A", likes: 98 },
    ],
  },
  "user-maya": {
    name: "MayaChords",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    role: "Acoustic & Vocalist",
    bio: "Fingerstyle arranger and acoustic chord melody enthusiast. Sharing weekly tab tutorials and chord charts on GeetHub.",
    location: "Austin, Texas",
    followers: 890,
    gear: ["Martin D-28", "Taylor 814ce", "Fishman Aura Spectrum DI"],
    videos: [
      { id: "v3", title: "Hotel California 12-string Acoustic Intro", url: "https://www.youtube.com/watch?v=BciS5krYL80", likes: 289 },
    ],
  },
};

export default function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [connected, setConnected] = useState(false);

  const artist = ARTIST_PROFILES[id] || {
    name: "Musician",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "Guitarist & Songwriter",
    bio: "Passionate guitar player sharing riffs, chord progressions, and performance videos.",
    location: "Global",
    followers: 450,
    gear: ["Acoustic Guitar", "Electric Guitar"],
    videos: [],
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 920 }}>
        <Link
          href="/community"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--t3)",
            fontWeight: 600,
            marginBottom: 24,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to Community
        </Link>

        {/* Profile Card */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: 36,
            marginBottom: 36,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <img
                src={artist.avatar}
                alt={artist.name}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--amber)",
                }}
              />
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 4px 0" }}>{artist.name}</h1>
                <span style={{ fontSize: 14, color: "var(--amber)", fontWeight: 700, display: "block", marginBottom: 6 }}>
                  {artist.role} · {artist.location}
                </span>
                <span style={{ fontSize: 13, color: "var(--t3)" }}>{artist.followers} Musician Connections</span>
              </div>
            </div>

            <button
              onClick={() => setConnected((c) => !c)}
              style={{
                padding: "12px 24px",
                borderRadius: 30,
                background: connected ? "rgba(255, 255, 255, 0.1)" : "var(--amber)",
                color: connected ? "#fff" : "#000",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {connected ? <><Check size={16} /> Connected</> : <><UserPlus size={16} /> Connect</>}
            </button>
          </div>

          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, margin: 0 }}>
            {artist.bio}
          </p>

          {/* Gear List */}
          {artist.gear && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t4)", display: "block", marginBottom: 8 }}>
                Current Rig & Guitar Gear
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {artist.gear.map((item: string) => (
                  <span
                    key={item}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid var(--border)",
                      color: "var(--t2)",
                    }}
                  >
                    🎸 {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
