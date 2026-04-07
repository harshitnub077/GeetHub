"use client";

import { User, Sparkles } from "lucide-react";

interface ArtistsSectionProps {
  onArtistClick: (artist: string) => void;
  selectedArtist: string | null;
}

export const ARTISTS = [
  "A.R. Rahman", "Adnan Sami", "Akhil Sachdeva", "Alisha Chinai", "Amaal Malik", "Ankit Tiwari", "Anuradha Paudwal",
  "Arijit Singh", "Armaan Malik", "Asha Bhosle", "Ayushmann Khurrana", "Bhupinder Singh", "Coke Studio", "Dhvani Bhanushali",
  "Farhan Akhtar", "Gajendra Verma", "Gulzar", "Hemant Kumar", "Ilaiyaraaja", "Jagjit Singh", "Jeet Gannguli", "Junoon",
  "Kailash Kher", "Kavita Krishnamurthy", "Kumar Sanu", "Lata Mangeshkar", "Madan Mohan", "Manna Dey", "Mika Singh",
  "Mohammad Irfan", "Mohit Chauhan", "Mukesh", "Nadeem Shravan", "Nusrat Fateh Ali Khan", "Palak Muchhal", "Papon",
  "Prateek Kuhad", "R.D. Burman", "Rahat Fateh Ali Khan", "Roop Kumar Rathore", "S.P. Balasubrahmanyam", "Salil Chowdhury",
  "Shaan", "Shankar Mahadevan", "Shibani Kashyap", "Soham Naik", "Sonu Nigam", "Sukhwinder Singh", "Suresh Wadkar",
  "Vinod Rathod", "Vishal Mishra", "Yesudas", "Abhijeet", "Ajay Atul", "Ali Azmat", "Alka Yagnik", "Amit Trivedi",
  "Anu Malik", "Anuv Jain", "Arko", "Aryans", "Atif Aslam", "Bappi Lahiri", "Chithra", "Darshan Raval", "Falak",
  "Fuzon", "Ghulam Ali", "Hariharan", "Himesh Reshammiya", "Indian Ocean", "Javed Ali", "Jubin Nautiyal", "K.K.",
  "Kamran Ahmed", "Kishore Kumar", "Kunal Ganjawala", "Lucky Ali", "Mahendra Kapoor", "Mehdi Hasan", "Mithoon",
  "Mohammed Rafi", "Monali Thakur", "Mustafa Zahid", "Neha Kakkar", "O.P. Nayyar", "Palash Sen", "Praak", "Pritam",
  "Rabbi Shergill", "Ram Sampath", "S.D. Burman", "Sadhana Sargam", "Salim Merchant", "Shafqat Amanat Ali", "Sharib Toshi",
  "Shreya Ghoshal", "Sona Mohapatra", "Strings", "Sunidhi Chauhan", "Udit Narayan", "Vishal Bhardwaj", "Vishal Shekhar", "Zubin Garg"
];

export function ArtistsSection({ onArtistClick, selectedArtist }: ArtistsSectionProps) {
  return (
    <section className="w-full mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Discovery Index</span>
          </div>
          <h2 className="text-4xl font-normal tracking-tight text-white/95">Legendary Artists</h2>
        </div>
        <div className="flex items-center gap-4 glass px-4 py-2 rounded-full border-white/5">
           <User className="h-4 w-4 text-primary" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
             {ARTISTS.length} Curated Archives
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {ARTISTS.map((artist) => {
          const isSelected = selectedArtist === artist;
          return (
            <button
              key={artist}
              onClick={() => onArtistClick(isSelected ? "" : artist)}
              className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 text-left overflow-hidden ${
                isSelected
                  ? "bg-primary/20 border-primary/40 shadow-[0_0_40px_rgba(99,102,241,0.1)]"
                  : "glass-dark border-white/5 hover:border-primary/20 hover:bg-white/[0.04]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
              )}
              <div className="flex flex-col gap-1 min-w-0 pr-8">
                <span className={`text-[11px] font-bold truncate transition-colors ${
                  isSelected ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary/60"
                }`}>
                  {artist}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">Archive</span>
              </div>
              <Sparkles className={`h-3 w-3 transition-opacity duration-500 ${isSelected ? 'opacity-100 text-primary' : 'opacity-0'}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
