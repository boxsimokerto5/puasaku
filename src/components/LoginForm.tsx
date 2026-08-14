import React, { useState } from 'react';
import { UserSession } from '../types';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

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

    if (cleanUser === 'admin' && cleanPass === 'admin') {
      onLogin({
        username: 'admin',
        role: 'admin',
        name: 'Administrator Asrama / Koordinator',
      });
    } else if (cleanUser === 'puasa' && cleanPass === 'puasa') {
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
      setError('Username atau Password salah! Pastikan kredensial yang Anda masukkan sesuai.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-emerald-900/10">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-emerald-100">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2.5 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 border border-emerald-600 shadow-md">
            <img src="/assets/logo.svg" alt="Logo Puasaku" className="w-14 h-14 object-contain" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight font-sans">
              PUASAKU
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                SRT 1 KEDIRI
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1.5 max-w-xs mx-auto">
              Sistem Informasi Pencatatan & Verifikasi Amalan Puasa Siswa
            </p>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-150">
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
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                required
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Clean Footer Info */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Portal Terproteksi • SMP / SMA SRT 1 Kediri
          </p>
        </div>
      </div>
    </div>
  );
};

