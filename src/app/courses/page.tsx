"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Star, Clock, CheckCircle, Lock, PlayCircle, Award, Sparkles, ArrowRight } from "lucide-react";
import { useProStore } from "@/lib/proStore";

const COURSES = [
  {
    slug: "beginner-guitar-accelerator",
    title: "Beginner Guitar Accelerator",
    desc: "Master your first 8 open chords, strumming patterns, and rhythm fundamentals to play hundreds of songs.",
    level: "Beginner",
    duration: "4.5 Hours",
    lessons: 8,
    instructor: "David Miller",
    isPro: false,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80",
    tags: ["Open Chords", "Rhythm", "Strumming"],
  },
  {
    slug: "fretboard-mastery-caged",
    title: "Fretboard Mastery & CAGED System",
    desc: "Demystify the guitar neck. Connect all 5 CAGED shapes, locate any chord instantly, and unlock triads anywhere.",
    level: "Intermediate",
    duration: "6 Hours",
    lessons: 10,
    instructor: "Sarah Jenkins",
    isPro: true,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    tags: ["CAGED", "Triads", "Fretboard"],
  },
  {
    slug: "blues-rock-soloing-blueprint",
    title: "Lead Guitar & Blues/Rock Soloing",
    desc: "Learn expressive bends, vibrato, double stops, and pentatonic target notes to craft singing, melodic solos.",
    level: "Intermediate / Advanced",
    duration: "7.5 Hours",
    lessons: 12,
    instructor: "Marcus Vance",
    isPro: true,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    tags: ["Blues", "Soloing", "Improvisation"],
  },
  {
    slug: "acoustic-fingerstyle-mastery",
    title: "Acoustic Fingerstyle & Percussive Grooves",
    desc: "Develop independent thumb basslines, Travis picking, slap harmonics, and acoustic guitar arrangements.",
    level: "All Levels",
    duration: "5 Hours",
    lessons: 9,
    instructor: "Elena Rostova",
    isPro: true,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80",
    tags: ["Fingerstyle", "Acoustic", "Percussive"],
  },
  {
    slug: "neo-soul-jazz-chords",
    title: "Neo-Soul & Modern Jazz Harmony",
    desc: "Master extended 9th, 11th, and 13th chords, drop-2 voicings, passing chords, and smooth voice leading.",
    level: "Advanced",
    duration: "6.5 Hours",
    lessons: 11,
    instructor: "Julian Hayes",
    isPro: true,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&auto=format&fit=crop&q=80",
    tags: ["Neo-Soul", "Jazz", "Extended Chords"],
  },
];

export default function CoursesPage() {
  const { isPro, openProModal } = useProStore();

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1060 }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 56px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(245, 166, 35, 0.1)",
              border: "1px solid rgba(245, 166, 35, 0.25)",
              color: "var(--amber)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <Award size={14} /> GeetHub Pro Masterclasses
          </div>

          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            World-Class Guitar Courses <br />
            <span style={{ color: "var(--amber)" }}>from Touring Professionals</span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--t3)", lineHeight: 1.6 }}>
            Structured step-by-step masterclasses with synchronized video lessons, interactive chord charts, and backing tracks to take your playing to the next level.
          </p>
        </div>

        {/* Course Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 28 }}>
          {COURSES.map((course) => {
            const isLocked = course.isPro && !isPro;

            return (
              <div
                key={course.slug}
                style={{
                  background: "rgba(18, 18, 24, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 22,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                  transition: "all 0.25s ease",
                }}
              >
                <div>
                  {/* Course Image */}
                  <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                    <img
                      src={course.image}
                      alt={course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18, 18, 24, 0.95), transparent 70%)" }} />

                    {/* Pro Badge or Free Badge */}
                    <div style={{ position: "absolute", top: 14, right: 14 }}>
                      {course.isPro ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: 20,
                            background: "var(--amber)",
                            color: "#000",
                            fontSize: 11,
                            fontWeight: 900,
                            letterSpacing: "0.05em",
                          }}
                        >
                          <Sparkles size={12} /> PRO
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            background: "rgba(76, 209, 55, 0.2)",
                            color: "#4cd137",
                            border: "1px solid #4cd137",
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          FREE
                        </span>
                      )}
                    </div>

                    <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase" }}>
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Course Body */}
                  <div style={{ padding: 22 }}>
                    <h3 style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
                      {course.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5, marginBottom: 16 }}>
                      {course.desc}
                    </p>

                    {/* Meta info */}
                    <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--t4)", marginBottom: 18 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={13} /> {course.duration}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <PlayCircle size={13} /> {course.lessons} Lessons
                      </span>
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {course.tags.map((t) => (
                        <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "var(--t3)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ padding: "0 22px 22px 22px" }}>
                  {isLocked ? (
                    <button
                      onClick={() => openProModal(course.title)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 12,
                        background: "rgba(245, 166, 35, 0.15)",
                        border: "1px solid rgba(245, 166, 35, 0.4)",
                        color: "var(--amber)",
                        fontWeight: 800,
                        fontSize: 13.5,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Lock size={15} /> Unlock with Pro
                    </button>
                  ) : (
                    <Link
                      href={`/courses/${course.slug}`}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 12,
                        background: "var(--amber)",
                        color: "#000",
                        fontWeight: 800,
                        fontSize: 13.5,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        boxSizing: "border-box",
                      }}
                    >
                      Start Course <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
