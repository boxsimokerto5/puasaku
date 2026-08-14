import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Student, FastingSession, FastingStatus, FastingRecordItem } from '../types';
import { getUniqueClasses } from '../data/students';
import { PdfExportModal } from './PdfExportModal';
import {
  CheckCircle2,
  XCircle,
  Moon,
  HelpCircle,
  Search,
  Filter,
  CheckCheck,
  RotateCcw,
  UserCheck,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  Users,
  Bookmark,
  UserPlus,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  FileText
} from 'lucide-react';

interface FastingInputterViewProps {
  students: Student[];
  activeSession: FastingSession;
  onUpdateRecord: (studentId: number, status: FastingStatus, notes?: string) => void;
  onBulkUpdateRecords: (updates: { studentId: number; status: FastingStatus }[]) => void;
  onOpenStudentModal: () => void;
}

export const FastingInputterView: React.FC<FastingInputterViewProps> = ({
  students,
  activeSession,
  onUpdateRecord,
  onBulkUpdateRecords,
  onOpenStudentModal,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  
  // Explicitly selected student IDs (selected via search or interaction)
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  
  // Toggle whether to reveal all students or keep hidden by default
  const [showAllStudents, setShowAllStudents] = useState<boolean>(false);
  
  // Search dropdown focus state
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const uniqueClasses = useMemo(() => getUniqueClasses(students), [students]);

  // Handle outside click to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set of student IDs that currently have a recorded status of 'berpuasa' in the active session
  const recordedStudentIds = useMemo(() => {
    const ids = new Set<number>();
    selectedStudentIds.forEach((id) => {
      const rec = activeSession.records[id];
      if (!rec || rec.status === 'berpuasa') {
        ids.add(id);
      }
    });
    Object.entries(activeSession.records).forEach(([studentIdStr, rec]) => {
      const record = rec as FastingRecordItem;
      if (record && record.status === 'berpuasa') {
        ids.add(Number(studentIdStr));
      }
    });
    return Array.from(ids);
  }, [activeSession.records, selectedStudentIds]);

  // Live Auto-Suggest List based on search query
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    return students
      .filter((s) => {
        const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
        const matchQuery =
          s.nama.toLowerCase().includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.nik.includes(q) ||
          s.no.toString() === q;
        return matchClass && matchQuery;
      })
      .slice(0, 8); // Top 8 suggestions
  }, [students, selectedClass, searchQuery]);

  // Filtered students to display in the main list below
  const displayedStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'SEMUA' || s.kelas === selectedClass;
      if (!matchClass) return false;

      const record = activeSession.records[s.id];
      const currentStatus = record?.status || 'belum_diisi';

      // If status is 'tidak_puasa', hide them from default active list unless searched explicitly or filter is 'tidak_puasa'
      if (currentStatus === 'tidak_puasa' && statusFilter !== 'tidak_puasa' && !searchQuery.trim()) {
        return false;
      }

      // Visibility Rule: Show if showAllStudents is TRUE OR if student is in recordedStudentIds
      const isVisibleInList =
        showAllStudents ||
        recordedStudentIds.includes(s.id) ||
        (searchQuery.trim().length > 0 &&
          (s.nama.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            s.nik.includes(searchQuery.toLowerCase().trim())));

      if (!isVisibleInList) return false;

      const matchStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      return matchStatus;
    });
  }, [
    students,
    selectedClass,
    showAllStudents,
    recordedStudentIds,
    searchQuery,
    statusFilter,
    activeSession.records,
  ]);

  // Overall statistics calculation
  const stats = useMemo(() => {
    let berpuasa = 0;
    let tidakPuasa = 0;
    let halangan = 0;
    let belumDiisi = 0;

    const classStudents =
      selectedClass === 'SEMUA'
        ? students
        : students.filter((s) => s.kelas === selectedClass);

    classStudents.forEach((s) => {
      const rec = activeSession.records[s.id];
      const status = rec?.status || 'belum_diisi';
      if (status === 'berpuasa') berpuasa++;
      else if (status === 'tidak_puasa') tidakPuasa++;
      else if (status === 'halangan') halangan++;
      else belumDiisi++;
    });

    const total = classStudents.length;
    const filled = total - belumDiisi;
    const percentFilled = total > 0 ? Math.round((filled / total) * 100) : 0;
    const percentPuasa = total > 0 ? Math.round((berpuasa / total) * 100) : 0;

    return {
      total,
      berpuasa,
      tidakPuasa,
      halangan,
      belumDiisi,
      filled,
      percentFilled,
      percentPuasa,
    };
  }, [students, selectedClass, activeSession.records]);

  // Select student from suggest dropdown
  const handleSelectStudentFromSuggest = (studentId: number) => {
    if (!selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds((prev) => [...prev, studentId]);
    }
    setIsSearchFocused(false);
  };

  // Helper to handle status update and keep selectedStudentIds in sync
  const handleUpdateStudentStatus = (studentId: number, status: FastingStatus) => {
    onUpdateRecord(studentId, status);
    if (status === 'berpuasa') {
      if (!selectedStudentIds.includes(studentId)) {
        setSelectedStudentIds((prev) => [...prev, studentId]);
      }
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  // Set status directly from suggest dropdown
  const handleDirectStatusFromSuggest = (studentId: number, status: FastingStatus) => {
    handleUpdateStudentStatus(studentId, status);
    setIsSearchFocused(false);
  };

  const handleBulkSetStatus = (status: FastingStatus) => {
    if (displayedStudents.length === 0) return;
    const updates = displayedStudents.map((s) => ({
      studentId: s.id,
      status,
    }));
    onBulkUpdateRecords(updates);
    if (status !== 'berpuasa') {
      const updatedIds = displayedStudents.map((s) => s.id);
      setSelectedStudentIds((prev) => prev.filter((id) => !updatedIds.includes(id)));
    }
  };

  const handleSaveNote = (studentId: number) => {
    const currentRecord = activeSession.records[studentId];
    const currentStatus = currentRecord?.status || 'belum_diisi';
    onUpdateRecord(studentId, currentStatus, noteText);
    setActiveNoteStudentId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Siswa ({selectedClass === 'SEMUA' ? 'Semua' : selectedClass})
            </p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Berpuasa
            </p>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-950">{stats.berpuasa}</span>
              <span className="text-xs text-emerald-600 font-semibold">({stats.percentPuasa}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Tidak Puasa
            </p>
            <p className="text-xl font-bold text-rose-950">{stats.tidakPuasa}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Halangan / Uzur
            </p>
            <p className="text-xl font-bold text-amber-950">{stats.halangan}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Class Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Progres Terisi ({stats.filled} dari {stats.total} Siswa)
            </span>
            <span className="font-bold text-emerald-800">{stats.percentFilled}% Selesai</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentFilled}%` }}
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          {/* Class Select Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedClass('SEMUA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedClass === 'SEMUA'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua Kelas
            </button>
            {uniqueClasses.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Cetak/Unduh Laporan Rekapitulasi PDF (SD, SMP, SMA)"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>Cetak PDF Rekapitulasi</span>
            </button>

            <button
              onClick={onOpenStudentModal}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Kelola/Upload CSV Data Siswa"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Kelola Data Siswa</span>
            </button>
          </div>
        </div>

        {/* Search Bar with Live Suggestions Dropdown (CORE FUNCTIONALITY) */}
        <div className="pt-2 space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Pencarian & Pemilihan Siswa
          </label>

          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Ketik nama, NIK, atau kelas siswa di sini untuk memunculkan saran..."
                className="w-full pl-10 pr-10 py-3 text-sm bg-emerald-50/40 border border-emerald-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Auto-Suggest Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border border-emerald-100 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-emerald-900 text-white text-[11px] font-bold flex justify-between items-center">
                  <span>Hasil Pencarian & Saran Siswa ({searchSuggestions.length})</span>
                  <span className="text-emerald-300 font-normal">Klik untuk memilih atau beri status</span>
                </div>

                {searchSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    Siswa tidak ditemukan dengan kata kunci &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchSuggestions.map((s) => {
                    const record = activeSession.records[s.id];
                    const status = record?.status || 'belum_diisi';

                    return (
                      <div
                        key={s.id}
                        className="p-3 hover:bg-emerald-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div
                          onClick={() => handleSelectStudentFromSuggest(s.id)}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                            {s.no}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs truncate">{s.nama}</p>
                            <p className="text-[11px] text-gray-500">
                              Kelas: <strong className="text-emerald-800">{s.kelas}</strong> | NIK: {s.nik || '-'}
                            </p>
                          </div>
                        </div>

                        {/* Direct Action Buttons inside Dropdown */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleDirectStatusFromSuggest(s.id, 'berpuasa')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              status === 'berpuasa'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Berpuasa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectStatusFromSuggest(s.id, 'tidak_puasa')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              status === 'tidak_puasa'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tidak</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectStatusFromSuggest(s.id, 'halangan')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              status === 'halangan'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 hover:bg-amber-500 hover:text-white'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Halangan</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Filter & Action Controls for Active List */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="berpuasa">✓ Berpuasa</option>
              <option value="tidak_puasa">✗ Tidak Puasa</option>
              <option value="halangan">🌙 Halangan/Uzur</option>
              <option value="belum_diisi">? Belum Diisi</option>
            </select>

            {/* Toggle show all / hidden button */}
            <button
              onClick={() => setShowAllStudents(!showAllStudents)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showAllStudents
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showAllStudents ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sembunyikan Siswa Lain (Default)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-gray-600" />
                  <span>Tampilkan Semua Siswa ({stats.total})</span>
                </>
              )}
            </button>
          </div>

          {/* Bulk Action Buttons for Displayed Students */}
          {displayedStudents.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleBulkSetStatus('berpuasa')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title="Tandai semua siswa terpilih sebagai BERPUASA"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Semua Puasa</span>
              </button>
              <button
                onClick={() => handleBulkSetStatus('belum_diisi')}
                className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Reset status siswa terpilih"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Status</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Student Checklist Table / Selected List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Daftar Siswa Terpilih & Diinput ({displayedStudents.length} Siswa Tampil)
            </span>
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {showAllStudents ? 'Menampilkan semua siswa' : 'Menampilkan siswa terpilih / dicari'}
          </span>
        </div>

        {displayedStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Daftar Siswa Belum Dipilih
            </p>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Ketik nama, NIK, atau no urut siswa pada <strong>kolom pencarian di atas</strong>.
              Siswa yang dicari / dipilih akan dimunculkan di sini untuk diinput status puasanya.
            </p>
            <button
              onClick={() => setShowAllStudents(true)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Atau Tampilkan Seluruh Siswa Kelas ({stats.total})</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedStudents.map((s, index) => {
              const record = activeSession.records[s.id];
              const status = record?.status || 'belum_diisi';
              const hasNote = Boolean(record?.notes);

              return (
                <div
                  key={s.id}
                  className={`p-4 transition-colors hover:bg-emerald-50/30 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    status === 'berpuasa'
                      ? 'bg-emerald-50/10'
                      : status === 'tidak_puasa'
                      ? 'bg-rose-50/10'
                      : status === 'halangan'
                      ? 'bg-amber-50/10'
                      : ''
                  }`}
                >
                  {/* Student Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {s.no || index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {s.nama}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          {s.kelas}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            s.jenisKelamin === 'Perempuan'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {s.jenisKelamin === 'Perempuan' ? 'P' : 'L'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        {s.nik && <span>NIK: {s.nik}</span>}
                        {s.namaIbu && <span>Ibu: {s.namaIbu}</span>}
                      </div>

                      {/* Display Note if exists */}
                      {hasNote && (
                        <div className="mt-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 inline-flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            <strong>Catatan:</strong> {record.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fasting Status Toggle Selector */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    {/* Berpuasa */}
                    <button
                      onClick={() => handleUpdateStudentStatus(s.id, 'berpuasa')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        status === 'berpuasa'
                          ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Berpuasa</span>
                    </button>

                    {/* Tidak Puasa */}
                    <button
                      onClick={() => handleUpdateStudentStatus(s.id, 'tidak_puasa')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        status === 'tidak_puasa'
                          ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tidak</span>
                    </button>

                    {/* Halangan */}
                    <button
                      onClick={() => handleUpdateStudentStatus(s.id, 'halangan')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        status === 'halangan'
                          ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Halangan</span>
                    </button>

                    {/* Notes Button */}
                    <button
                      onClick={() => {
                        setActiveNoteStudentId(s.id);
                        setNoteText(record?.notes || '');
                      }}
                      className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800 transition-all cursor-pointer"
                      title="Tambah Catatan Sederhana"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note Input Modal / Floating Drawer */}
      {activeNoteStudentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Catatan Khusus Puasa Siswa
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Keterangan / Alasan (Opsional)
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Contoh: Halangan uzur syar'i, sakit flu, atau pulang setengah hari..."
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 h-24"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveNote(activeNoteStudentId)}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {isPdfModalOpen && (
        <PdfExportModal
          students={students}
          session={activeSession}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </div>
  );
};
