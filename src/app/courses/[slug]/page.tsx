"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, CheckCircle2, Lock, Sparkles, BookOpen, Clock, Award } from "lucide-react";
import { useProStore } from "@/lib/proStore";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  chords: string[];
}

const COURSE_LESSONS: Record<string, { title: string; instructor: string; isPro: boolean; lessons: Lesson[] }> = {
  "beginner-guitar-accelerator": {
    title: "Beginner Guitar Accelerator",
    instructor: "David Miller",
    isPro: false,
    lessons: [
      {
        id: "l1",
        title: "Lesson 1: Holding the Guitar & First 2 Chords (Em & A7)",
        duration: "14:20",
        videoUrl: "https://www.youtube.com/embed/2_XzXg4zN74",
        summary: "Learn correct posture, thumb positioning, and transition effortlessly between Em and A7 chords.",
        chords: ["Em", "A7"],
      },
      {
        id: "l2",
        title: "Lesson 2: The Golden 4 Chords (G, D, Em, C)",
        duration: "18:45",
        videoUrl: "https://www.youtube.com/embed/zFUwY0ZfZ-A",
        summary: "Unlock the 4 most famous chords in pop music history and practice standard 4/4 down-up strumming.",
        chords: ["G", "D", "Em", "C"],
      },
      {
        id: "l3",
        title: "Lesson 3: Rhythm, Accents, and Smooth Changes",
        duration: "16:10",
        videoUrl: "https://www.youtube.com/embed/BBz-Jyr23M4",
        summary: "Keep a steady internal clock, use wrist relaxation, and eliminate pausing between chord changes.",
        chords: ["Am", "C", "Fmaj7", "G"],
      },
    ],
  },
  "fretboard-mastery-caged": {
    title: "Fretboard Mastery & CAGED System",
    instructor: "Sarah Jenkins",
    isPro: true,
    lessons: [
      {
        id: "l1",
        title: "Lesson 1: Deconstructing the 5 Open CAGED Shapes",
        duration: "20:15",
        videoUrl: "https://www.youtube.com/embed/4yZ3v5nC88c",
        summary: "Understand how the open C, A, G, E, and D chord shapes map across the entire neck as moveable barre chords.",
        chords: ["C", "A", "G", "E", "D"],
      },
      {
        id: "l2",
        title: "Lesson 2: Connecting Adjacent Shapes Across the Fretboard",
        duration: "24:00",
        videoUrl: "https://www.youtube.com/embed/4yZ3v5nC88c",
        summary: "Learn anchor roots to jump between position 1 and position 3 without looking down.",
        chords: ["G", "Em", "C", "D"],
      },
    ],
  },
};

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { isPro, openProModal } = useProStore();
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const courseData = COURSE_LESSONS[slug] || COURSE_LESSONS["beginner-guitar-accelerator"];
  const currentLesson = courseData.lessons[activeLessonIdx] || courseData.lessons[0];

  const isLocked = courseData.isPro && !isPro;

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <Link
          href="/courses"
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
          <ArrowLeft size={14} /> Back to All Courses
        </Link>

        {/* Course Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {courseData.isPro && (
                <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 4, background: "var(--amber)", color: "#000" }}>
                  PRO COURSE
                </span>
              )}
              <span style={{ fontSize: 13, color: "var(--t3)" }}>Instructor: {courseData.instructor}</span>
            </div>
            <h1 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, margin: 0 }}>
              {courseData.title}
            </h1>
          </div>
        </div>

        {/* Two Column Layout: Player on Left, Lessons on Right */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, alignItems: "start" }}>
          {/* Main Video & Content Column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Video Player Box */}
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%",
                background: "#000",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
                marginBottom: 20,
              }}
            >
              {isLocked ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    textAlign: "center",
                    background: "rgba(10, 10, 14, 0.95)",
                  }}
                >
                  <Lock size={44} style={{ color: "var(--amber)", marginBottom: 14 }} />
                  <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Pro Subscription Required</h3>
                  <p style={{ fontSize: 14, color: "var(--t3)", maxWidth: 360, marginBottom: 20 }}>
                    Unlock full masterclasses, downloadable tab PDFs, and practice backing tracks with GeetHub Pro.
                  </p>
                  <button
                    onClick={() => openProModal(courseData.title)}
                    style={{
                      padding: "12px 28px",
                      borderRadius: 30,
                      background: "var(--amber)",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: 14,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Unlock with Pro
                  </button>
                </div>
              ) : (
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
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
              )}
            </div>

            {/* Lesson Title & Summary */}
            <div
              style={{
                background: "rgba(18, 18, 24, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{currentLesson.title}</h2>
                <button
                  onClick={() => setCompleted((c) => ({ ...c, [currentLesson.id]: !c[currentLesson.id] }))}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: completed[currentLesson.id] ? "rgba(76, 209, 55, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    color: completed[currentLesson.id] ? "#4cd137" : "var(--t3)",
                    border: `1px solid ${completed[currentLesson.id] ? "#4cd137" : "var(--border)"}`,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <CheckCircle2 size={14} /> {completed[currentLesson.id] ? "Completed" : "Mark as Done"}
                </button>
              </div>

              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 18 }}>
                {currentLesson.summary}
              </p>

              {/* Chords Used in Lesson */}
              {currentLesson.chords && currentLesson.chords.length > 0 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--amber)", display: "block", marginBottom: 8 }}>
                    Chords Taught in this Lesson
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {currentLesson.chords.map((c) => (
                      <Link
                        key={c}
                        href="/tools/chords"
                        style={{
                          padding: "4px 12px",
                          borderRadius: 6,
                          background: "rgba(245, 166, 35, 0.1)",
                          border: "1px solid rgba(245, 166, 35, 0.3)",
                          color: "var(--amber)",
                          fontFamily: "var(--f-mono)",
                          fontSize: 13,
                          fontWeight: 800,
                          textDecoration: "none",
                        }}
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Lessons Playlist */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} style={{ color: "var(--amber)" }} /> Course Curriculum
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {courseData.lessons.map((lesson, idx) => {
                const isActive = activeLessonIdx === idx;
                const isDone = completed[lesson.id];

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIdx(idx)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 14,
                      borderRadius: 12,
                      background: isActive ? "rgba(245, 166, 35, 0.12)" : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${isActive ? "rgba(245, 166, 35, 0.4)" : "transparent"}`,
                      color: isActive ? "var(--amber)" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? "var(--amber)" : "var(--t4)" }}>
                        Part {idx + 1}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--t4)" }}>{lesson.duration}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                      {lesson.title.split(":")[1] || lesson.title}
                    </div>
                    {isDone && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4cd137", fontWeight: 700, marginTop: 6 }}>
                        <CheckCircle2 size={12} /> Done
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
