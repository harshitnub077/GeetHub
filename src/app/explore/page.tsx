"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Loader2, Music, ChevronRight, X, Users } from "lucide-react";
import { ArtistsSection } from "@/components/ArtistsSection";

const FILTERS = [
  { label:"All",          key:"all" },
  { label:"🎸 Guitar",    key:"guitar" },
  { label:"🎹 Piano",     key:"piano" },
  { label:"🎸 Ukulele",   key:"ukulele" },
  { label:"🟢 Beginner",  key:"beginner" },
  { label:"🟡 Intermediate",key:"intermediate" },
  { label:"🔴 Expert",    key:"expert" },
  { label:"Bollywood",    key:"bollywood" },
  { label:"Rock",         key:"rock" },
  { label:"Pop",          key:"pop" },
  { label:"Classical",    key:"classical" },
];

function SongRow({ song, i }: { song:any; i:number }) {
  return (
    <motion.div
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.35, delay:i*0.025, ease:[0.16,1,0.3,1] }}
    >
      <Link href={`/song/${song.id}`}
        style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderRadius:12, border:"1px solid var(--border)", background:"rgba(255,255,255,0.02)", marginBottom:8, transition:"all 0.2s", gap:12 }}
        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(245,166,35,0.25)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor="var(--border)"; }}
      >
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, fontSize:15, color:"var(--t1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{song.title}</span>
            <span style={{ fontSize:13, color:"var(--t3)", flexShrink:0 }}>—</span>
            <span style={{ fontSize:13, color:"var(--t2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{song.artist}</span>
          </div>
          {song.genre && (
            <p style={{ fontSize:11, color:"var(--t3)", marginTop:3 }}>{song.genre}</p>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <span className="badge badge-intermediate" style={{ display:"none" }} />
          <ChevronRight size={16} style={{ color:"var(--t3)" }}/>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderRadius:12, border:"1px solid var(--border)", marginBottom:8 }}>
      <div className="skeleton" style={{ height:14, width:"30%", flexShrink:0 }}/>
      <div className="skeleton" style={{ height:12, width:"20%" }}/>
      <div style={{ marginLeft:"auto" }}><div className="skeleton" style={{ height:12, width:60 }}/></div>
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery]       = useState(searchParams.get("q") || "");
  const [filter, setFilter]     = useState(searchParams.get("filter") || "all");
  const [genre, setGenre]       = useState(searchParams.get("genre") || "");
  const [songs, setSongs]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage]         = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  const doSearch = async (q:string, g:string, p:number, append=false) => {
    if (p===1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q",q);
      if (g) params.set("artist",g);
      params.set("page",String(p));
      params.set("limit","30");
      const r = await fetch(`/api/songs/search?${params}`);
      const d = await r.json();
      if (append) setSongs(prev=>[...prev,...(d.songs||[])]);
      else setSongs(d.songs||[]);
      setPagination(d.pagination);
    } catch { if(!append) setSongs([]); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      doSearch(query, genre, 1);
      const p = new URLSearchParams();
      if (query) p.set("q",query);
      if (genre) p.set("genre",genre);
      if (filter !== "all") p.set("filter",filter);
      router.replace(`/explore?${p}`);
    }, 300);
    return ()=>clearTimeout(t);
  }, [query, genre, filter]);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setGenre(searchParams.get("genre") || "");
    setFilter(searchParams.get("filter") || "all");
  }, [searchParams]);

  const loadMore = useCallback(() => {
    if (loadingMore || !pagination || page >= pagination.pages) return;
    const next = page + 1;
    setPage(next);
    doSearch(query, genre, next, true);
  }, [page, pagination, loadingMore, query, genre]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { threshold: 0.1 });
    
    observer.observe(target);
    return () => observer.unobserve(target);
  }, [loadMore]);

  return (
    <div style={{ background:"var(--obsidian)", minHeight:"100vh", paddingTop:60 }}>
      {/* Header */}
      <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"36px 0 0" }}>
        <div className="container">
          <h1 style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(28px,5vw,48px)", marginBottom:24 }}>
            Explore <span className="text-gradient">{genre||"all songs"}</span>
          </h1>

          {/* Search */}
          <div style={{ position:"relative", marginBottom:20 }}>
            <Search size={18} style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"var(--t3)", pointerEvents:"none" }}/>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Search songs, artists…"
              className="input-field"
              style={{ paddingLeft:46, fontSize:16 }}
            />
            {query && (
              <button onClick={()=>setQuery("")} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--t3)", cursor:"pointer" }}>
                <X size={16}/>
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="scrollbar-hide" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:16 }}>
            {FILTERS.map(f=>(
              <button key={f.key} onClick={()=>setFilter(f.key)}
                className={`btn btn-sm ${filter===f.key?"btn-primary":"btn-surface"}`}
                style={{ flexShrink:0, borderRadius:999, fontWeight:600 }}
              >
                {f.label}
              </button>
            ))}
            {genre && (
              <button onClick={()=>setGenre("")} className="btn btn-sm btn-danger" style={{ flexShrink:0, borderRadius:999, gap:4 }}>
                <X size={12}/> {genre}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <ArtistsSection 
          selectedArtist={genre} 
          onArtistClick={(a) => setGenre(a)} 
        />
      </div>

      {/* Results */}
      <div className="container" style={{ paddingTop:32, paddingBottom:80 }}>
        {loading ? (
          <div>{[...Array(10)].map((_,i)=><SkeletonRow key={i}/>)}</div>
        ) : songs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:"var(--t3)" }}>
            <Music size={48} style={{ margin:"0 auto 16px", opacity:.3 }}/>
            <p style={{ fontSize:16, fontWeight:600 }}>No songs found. Try a different search.</p>
            <button onClick={()=>{setQuery(""); setGenre(""); setFilter("all");}} className="btn btn-surface btn-md" style={{ marginTop:20 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize:12, color:"var(--t3)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:16 }}>
              {pagination?.total?.toLocaleString()} songs • Page {pagination?.page} of {pagination?.pages}
            </p>
            <AnimatePresence mode="wait">
              <div key={`${query}-${genre}-${filter}`}>
                {songs.map((s,i)=><SongRow key={s.id} song={s} i={i}/>)}
              </div>
            </AnimatePresence>

            {pagination && pagination.page < pagination.pages && (
              <div ref={observerTarget} style={{ textAlign:"center", marginTop:32, paddingBottom:32 }}>
                {loadingMore && <Loader2 size={24} style={{ color:"var(--amber)", animation:"spin 0.6s linear infinite", margin:"0 auto" }}/>}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function ExplorePage() {
  return <Suspense fallback={<div style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center" }}><Loader2 size={32} style={{ color:"var(--amber)", animation:"spin 0.8s linear infinite" }}/></div>}>
    <ExploreContent/>
  </Suspense>;
}
