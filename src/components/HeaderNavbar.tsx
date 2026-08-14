import React from 'react';
import { UserSession } from '../types';
import { BookOpen, LogOut, ShieldCheck, UserCheck, Calendar, Sparkles } from 'lucide-react';

interface HeaderNavbarProps {
  user: UserSession;
  onLogout: () => void;
  activeSessionTitle?: string;
  activeSessionDate?: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  user,
  onLogout,
  activeSessionTitle,
  activeSessionDate,
}) => {
  const isPenginput = user.role === 'penginput';

  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-emerald-50 tracking-wide">
                  Sekolah Rakyat Kediri
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-800 text-emerald-200 border border-emerald-700">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> SIM Puasa
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                Pencatatan & Verifikasi Amalan Puasa Siswa
              </p>
            </div>
          </div>

          {/* Active Session Badge & Role Info */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {activeSessionTitle && (
              <div className="hidden lg:flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 rounded-lg px-3 py-1.5 text-xs text-emerald-200">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-emerald-100">{activeSessionTitle}</span>
                {activeSessionDate && (
                  <span className="text-emerald-400 font-mono">({activeSessionDate})</span>
                )}
              </div>
            )}

            {/* Role Badge */}
            <div className="flex items-center gap-2 bg-emerald-800/80 border border-emerald-700 rounded-lg px-3 py-1.5">
              {isPenginput ? (
                <UserCheck className="w-4 h-4 text-amber-300" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-emerald-300 font-medium">
                  {isPenginput ? 'Penginput Data Siswa' : 'Petugas Pengecek'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-red-600/90 text-emerald-100 hover:text-white border border-emerald-700 hover:border-red-500 text-xs font-semibold transition-all duration-150 cursor-pointer"
              title="Keluar dari sistem"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
