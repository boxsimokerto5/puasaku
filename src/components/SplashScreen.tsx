import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2200,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress timer
    const intervalTime = 30;
    const step = 100 / (durationMs / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Trigger fade out slightly before finish
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(0, durationMs - 400));

    // Finish splash screen
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-radial from-emerald-900 via-emerald-950 to-[#021c15] text-white transition-opacity duration-500 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top institution tag */}
      <div className="relative z-10 text-center animate-fade-in">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-emerald-800/60 text-amber-300 border border-emerald-700/60 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Sekolah Rakyat Terpadu
        </span>
      </div>

      {/* Center Brand / Logo & Name */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* Animated Logo Container */}
        <div className="relative group">
          {/* Subtle Ambient Glow Ring */}
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-400/20 via-emerald-400/30 to-amber-300/20 rounded-full blur-xl animate-pulse" />
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-2 bg-gradient-to-b from-emerald-700/60 to-emerald-950/80 border border-emerald-500/40 shadow-2xl flex items-center justify-center">
            <img
              src="/assets/logo.svg"
              alt="Logo Puasaku SRT 1 Kediri"
              className="w-full h-full object-contain drop-shadow-lg transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-sm font-sans">
            PUASAKU
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1.5px] w-6 bg-amber-400/60 rounded-full" />
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-emerald-200 uppercase">
              SRT 1 KEDIRI
            </p>
            <div className="h-[1.5px] w-6 bg-amber-400/60 rounded-full" />
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium pt-1">
            Sistem Informasi Pencatatan & Verifikasi Amalan Puasa Siswa
          </p>
        </div>

        {/* Progress Loading Indicator */}
        <div className="w-44 sm:w-56 space-y-2 pt-2">
          <div className="h-1.5 w-full bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-700/50 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-75 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer & Skip prompt */}
      <div className="relative z-10 text-center space-y-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-white transition-colors cursor-pointer bg-emerald-900/40 hover:bg-emerald-900/80 px-3 py-1.5 rounded-full border border-emerald-800/60"
        >
          <span>Masuk Aplikasi</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[10px] text-emerald-500">
          © {new Date().getFullYear()} Sekolah Rakyat Kabupaten Kediri
        </p>
      </div>
    </div>
  );
};
