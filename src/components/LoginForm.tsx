import React, { useState } from 'react';
import { UserSession } from '../types';
import { BookOpen, ShieldCheck, UserCheck, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: (session: UserSession) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'puasa' && cleanPass === 'puasa') {
      onLogin({
        username: 'puasa',
        role: 'penginput',
        name: 'Petugas Input Data',
      });
    } else if (cleanUser === 'cekpuasa' && cleanPass === 'cekpuasa') {
      onLogin({
        username: 'cekpuasa',
        role: 'pengecek',
        name: 'Petugas Pengecek / Verifikator',
      });
    } else {
      setError('Username atau Password salah! Gunakan "puasa" atau "cekpuasa".');
    }
  };

  const handleQuickLogin = (role: 'penginput' | 'pengecek') => {
    if (role === 'penginput') {
      setUsername('puasa');
      setPassword('puasa');
      onLogin({
        username: 'puasa',
        role: 'penginput',
        name: 'Petugas Input Data',
      });
    } else {
      setUsername('cekpuasa');
      setPassword('cekpuasa');
      onLogin({
        username: 'cekpuasa',
        role: 'pengecek',
        name: 'Petugas Pengecek / Verifikator',
      });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-emerald-900/10">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-emerald-100">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 shadow-sm">
            <BookOpen className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950 tracking-tight">
              Sekolah Rakyat Kediri
            </h2>
            <p className="text-sm text-emerald-700 font-medium mt-1">
              Sistem Informasi Pencatatan & Verifikasi Puasa
            </p>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username (puasa / cekpuasa)"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Access Box for User Guidance */}
        <div className="border-t border-emerald-100 pt-5 space-y-3">
          <p className="text-xs text-gray-500 text-center font-medium">
            Atau pilih role akun untuk uji coba cepat:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('penginput')}
              className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Penginput Data</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                User: <span className="font-mono font-bold">puasa</span> | Pass: <span className="font-mono font-bold">puasa</span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('pengecek')}
              className="p-3 text-left rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Petugas Pengecek</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                User: <span className="font-mono font-bold">cekpuasa</span> | Pass: <span className="font-mono font-bold">cekpuasa</span>
              </p>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <span className="inline-flex items-center text-[11px] text-emerald-700/80 font-medium gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Terintegrasi dengan 80+ Data Siswa Terdaftar
          </span>
        </div>
      </div>
    </div>
  );
};
