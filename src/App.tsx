import React, { useState, useEffect } from 'react';
import { UserSession, FastingSession, FastingStatus, Student } from './types';
import {
  getStoredStudents,
  saveStoredStudents,
  resetStoredStudents,
  getStoredSessions,
  saveSession,
  saveAllStoredSessions,
  deleteSession,
} from './data/students';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LoginForm } from './components/LoginForm';
import { SessionSelector } from './components/SessionSelector';
import { FastingInputterView } from './components/FastingInputterView';
import { FastingCheckerView } from './components/FastingCheckerView';
import { StudentDataModal } from './components/StudentDataModal';
import { CheckCircle2, BookmarkCheck, Calendar, BookOpen, Sparkles } from 'lucide-react';

const USER_SESSION_KEY = 'sr_kediri_user_session_v1';

export default function App() {
  // Active Logged-in User Session State
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Master Students Data
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());

  // Fasting Sessions Data
  const [sessions, setSessions] = useState<Record<string, FastingSession>>(() =>
    getStoredSessions()
  );

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const all = getStoredSessions();
    const keys = Object.keys(all);
    return keys.length > 0 ? keys[0] : '2026-08-27_Puasa Senin';
  });

  // Modal & Toast States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show auto-dismiss toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Login handler
  const handleLogin = (session: UserSession) => {
    setUser(session);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error(e);
    }
    showToast(`Selamat datang, ${session.name}!`);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
  };

  // Update Students master data
  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
  };

  const handleResetStudents = () => {
    const reset = resetStoredStudents();
    setStudents(reset);
  };

  // Create new Fasting Session
  const handleCreateSession = (title: string, date: string) => {
    const id = `${date}_${title.trim().replace(/\s+/g, '_')}`;
    const newSession: FastingSession = {
      id,
      title,
      date,
      records: {},
      isVerified: false,
      createdById: user?.username,
      updatedAt: new Date().toISOString(),
    };

    saveSession(newSession);
    const updatedSessions = getStoredSessions();
    setSessions(updatedSessions);
    setActiveSessionId(id);
    showToast(`Sesi baru "${title}" berhasil dibuat!`);
  };

  // Update single student record in active session
  const handleUpdateRecord = (
    studentId: number,
    status: FastingStatus,
    notes?: string
  ) => {
    const activeSession = sessions[activeSessionId];
    if (!activeSession) return;

    const updatedRecords = {
      ...activeSession.records,
      [studentId]: {
        studentId,
        status,
        notes: notes !== undefined ? notes : activeSession.records[studentId]?.notes,
        updatedAt: new Date().toISOString(),
      },
    };

    const updatedSession: FastingSession = {
      ...activeSession,
      records: updatedRecords,
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: updatedSession,
    }));
  };

  // Bulk update student records (e.g., mark all as fasting)
  const handleBulkUpdateRecords = (
    updates: { studentId: number; status: FastingStatus }[]
  ) => {
    const activeSession = sessions[activeSessionId];
    if (!activeSession) return;

    const updatedRecords = { ...activeSession.records };

    updates.forEach(({ studentId, status }) => {
      updatedRecords[studentId] = {
        studentId,
        status,
        notes: updatedRecords[studentId]?.notes,
        updatedAt: new Date().toISOString(),
      };
    });

    const updatedSession: FastingSession = {
      ...activeSession,
      records: updatedRecords,
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: updatedSession,
    }));

    showToast(`Berhasil memperbarui ${updates.length} data siswa!`);
  };

  // Verify Fasting Session by Verifier (pengecek)
  const handleVerifySession = (verifiedBy: string, verifierNotes?: string) => {
    const activeSession = sessions[activeSessionId];
    if (!activeSession) return;

    const updatedSession: FastingSession = {
      ...activeSession,
      isVerified: true,
      verifiedBy,
      verifierNotes,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSession(updatedSession);
    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: updatedSession,
    }));

    showToast(`Sesi "${activeSession.title}" resmi disahkan oleh ${verifiedBy}!`);
  };

  // Delete Fasting Session
  const handleDeleteSession = (sessionId: string) => {
    const sessionToDelete = sessions[sessionId];
    deleteSession(sessionId);
    const updatedSessions = getStoredSessions();
    setSessions(updatedSessions);

    const keys = Object.keys(updatedSessions);
    if (activeSessionId === sessionId) {
      if (keys.length > 0) {
        setActiveSessionId(keys[0]);
      } else {
        const defaultId = `${new Date().toISOString().split('T')[0]}_Puasa_Senin`;
        const defaultSession: FastingSession = {
          id: defaultId,
          title: 'Puasa Sunnah Senin',
          date: new Date().toISOString().split('T')[0],
          records: {},
          isVerified: false,
          updatedAt: new Date().toISOString(),
        };
        saveSession(defaultSession);
        const reloaded = getStoredSessions();
        setSessions(reloaded);
        setActiveSessionId(defaultId);
      }
    }
    showToast(`Sesi "${sessionToDelete?.title || 'Riwayat'}" berhasil dihapus!`);
  };

  // Get active session object safely
  const activeSession = sessions[activeSessionId] || {
    id: activeSessionId,
    title: 'Puasa Sunnah Senin',
    date: '2026-08-27',
    records: {},
    isVerified: false,
  };

  // If user is not logged in, show Login Screen
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-emerald-950/5 flex flex-col font-sans text-gray-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <HeaderNavbar
        user={user}
        onLogout={handleLogout}
        activeSessionTitle={activeSession.title}
        activeSessionDate={activeSession.date}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        {/* Session Selector / Creator Block */}
        <SessionSelector
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id)}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          isPenginput={user.role === 'penginput'}
        />

        {/* View Switcher based on User Role */}
        {user.role === 'penginput' ? (
          <FastingInputterView
            students={students}
            activeSession={activeSession}
            onUpdateRecord={handleUpdateRecord}
            onBulkUpdateRecords={handleBulkUpdateRecords}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
          />
        ) : (
          <FastingCheckerView
            students={students}
            activeSession={activeSession}
            user={user}
            onVerifySession={handleVerifySession}
          />
        )}
      </main>

      {/* Student Data Management Modal */}
      <StudentDataModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        onUpdateStudents={handleUpdateStudents}
        onResetStudents={handleResetStudents}
      />

      {/* Clean Footer */}
      <footer className="bg-emerald-950 text-emerald-300/80 text-xs py-5 border-t border-emerald-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-emerald-100">
              Sekolah Rakyat Kabupaten Kediri
            </span>
          </div>
          <p className="text-[11px] text-emerald-400/70">
            Aplikasi Pencatatan & Verifikasi Amalan Puasa Siswa © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
