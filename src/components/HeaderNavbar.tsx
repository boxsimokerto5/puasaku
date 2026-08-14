import React from 'react';
import { UserSession } from '../types';
import {
  LogOut,
  ShieldCheck,
  UserCheck,
  Calendar,
  KeyRound,
  Sliders,
  CheckSquare,
  Edit3,
  Database,
  Cloud,
  CloudOff,
  Download,
  Smartphone,
} from 'lucide-react';

interface HeaderNavbarProps {
  user: UserSession;
  onLogout: () => void;
  activeSessionTitle?: string;
  activeSessionDate?: string;
  activeAdminTab?: 'admin' | 'input' | 'checker';
  onSelectAdminTab?: (tab: 'admin' | 'input' | 'checker') => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseConfig?: () => void;
  onInstallPwa?: () => void;
  isPwaInstalled?: boolean;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  user,
  onLogout,
  activeSessionTitle,
  activeSessionDate,
  activeAdminTab = 'admin',
  onSelectAdminTab,
  isSupabaseConnected = false,
  onOpenSupabaseConfig,
  onInstallPwa,
  isPwaInstalled = false,
}) => {
  const isAdmin = user.role === 'admin';
  const isPenginput = user.role === 'penginput';

  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-amber-400/40 p-1 flex items-center justify-center shadow-inner shrink-0">
              <img src="/assets/logo.svg" alt="Logo Puasaku" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-amber-300 tracking-wide font-sans">
                  PUASAKU
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-800 text-emerald-100 border border-emerald-700">
                  SRT 1 KEDIRI
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium">
                Pencatatan & Verifikasi Amalan Puasa Siswa
              </p>
            </div>
          </div>

          {/* Admin Navigation Tabs (Only visible when user is Admin) */}
          {isAdmin && onSelectAdminTab && (
            <div className="flex items-center bg-emerald-950/80 p-1 rounded-xl border border-emerald-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => onSelectAdminTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeAdminTab === 'admin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectAdminTab('input')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeAdminTab === 'input'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Form Input</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectAdminTab('checker')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeAdminTab === 'checker'
                    ? 'bg-amber-500 text-emerald-950 shadow'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/60'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Ceklist Pengecek</span>
              </button>
            </div>
          )}

          {/* Active Session Badge, Cloud DB Status & Role Info */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
            {/* Supabase Status Indicator (Display Only, Protected from Edit) */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border select-none ${
                isSupabaseConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-700/40'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              {isSupabaseConnected ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Supabase Cloud</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 text-emerald-400" />
                  <span className="hidden md:inline">Tersimpan</span>
                </>
              )}
            </div>

            {/* PWA Install Button (If not installed) */}
            {!isPwaInstalled && onInstallPwa && (
              <button
                type="button"
                onClick={onInstallPwa}
                title="Pasang aplikasi PUASAKU ke HP/Desktop untuk akses cepat dan offline"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-sm transition-all border border-amber-300 cursor-pointer animate-pulse"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pasang PWA</span>
              </button>
            )}

            {activeSessionTitle && (
              <div className="hidden 2xl:flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 rounded-lg px-3 py-1.5 text-xs text-emerald-200">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-emerald-100">{activeSessionTitle}</span>
                {activeSessionDate && (
                  <span className="text-emerald-400 font-mono">({activeSessionDate})</span>
                )}
              </div>
            )}

            {/* Role Badge */}
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border ${
                isAdmin
                  ? 'bg-purple-900/80 border-purple-600'
                  : isPenginput
                  ? 'bg-amber-900/60 border-amber-600'
                  : 'bg-emerald-800/80 border-emerald-700'
              }`}
            >
              {isAdmin ? (
                <KeyRound className="w-4 h-4 text-purple-300" />
              ) : isPenginput ? (
                <UserCheck className="w-4 h-4 text-amber-300" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-emerald-200 font-medium mt-0.5">
                  {isAdmin
                    ? '👑 Administrator Utama'
                    : isPenginput
                    ? '✍️ Penginput Data'
                    : '🛡️ Petugas Pengecek'}
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


