"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Music, Play, X, ChevronUp, ChevronDown } from "lucide-react";

interface SpotifyPlayerProps {
  title: string;
  artist: string;
  defaultOpen?: boolean;
}

export default function SpotifyPlayer({ title, artist, defaultOpen = false }: SpotifyPlayerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<{
    directUrl: string;
    embedUrl: string;
    track?: { name: string; artist: string; albumCover?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const query = `${title} ${artist}`.trim();

  useEffect(() => {
    let isMounted = true;
    async function fetchSpotify() {
      try {
        setLoading(true);
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (err) {
        console.error("Spotify lookup failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSpotify();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const directLink = data?.directUrl || `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  const embedLink = data?.embedUrl || `https://open.spotify.com/embed?uri=spotify:search:${encodeURIComponent(query)}`;

  return (
    <div style={{ margin: "16px 0", position: "relative" }}>
      {/* Top Banner Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          padding: "10px 16px",
          background: "linear-gradient(135deg, rgba(29, 185, 84, 0.12), rgba(18, 18, 24, 0.9))",
          border: "1px solid rgba(29, 185, 84, 0.3)",
          borderRadius: isOpen ? "12px 12px 0 0" : 12,
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Official Spotify Icon */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#1DB954",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.217.355-.678.468-1.033.251-2.83-1.728-6.393-2.12-10.592-1.16-.407.094-.813-.16-.906-.566-.094-.407.16-.813.566-.906 4.604-1.052 8.544-.606 11.712 1.348.355.217.468.678.253 1.033zm1.467-3.262c-.274.444-.857.584-1.301.31-3.238-1.99-8.176-2.566-12.007-1.403-.5.152-1.033-.13-1.185-.63-.152-.5.13-1.033.63-1.185 4.385-1.332 9.821-.689 13.553 1.607.444.274.584.857.31 1.301zm.135-3.398c-3.882-2.305-10.288-2.518-14.004-1.39-.594.18-1.226-.153-1.406-.747-.18-.594.153-1.226.747-1.406 4.277-1.298 11.345-1.045 15.82 1.61.534.316.708 1.008.392 1.542-.316.534-1.008.708-1.549.391z" />
            </svg>
          </div>

          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "block" }}>
              Listen & Play Along on Spotify
            </span>
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>
              {data?.track ? `${data.track.name} · ${data.track.artist}` : `${title} · ${artist}`}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Open in Spotify Direct Button */}
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 20,
              background: "#1DB954",
              color: "#000",
              fontWeight: 800,
              fontSize: 12,
              textDecoration: "none",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Open in Spotify <ExternalLink size={12} />
          </a>

          {/* Toggle Embed Player */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="hide-mobile">{isOpen ? "Hide Player" : "Show Player"}</span>
          </button>
        </div>
      </div>

      {/* Embedded Spotify Player */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              background: "#121212",
              border: "1px solid rgba(29, 185, 84, 0.3)",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              padding: 12,
            }}
          >
            <iframe
              src={embedLink}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: 8, border: "none" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
