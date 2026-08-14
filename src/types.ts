export type FastingStatus = 'berpuasa' | 'tidak_puasa' | 'halangan' | 'belum_diisi';

export interface Student {
  id: number;
  no: number;
  nama: string;
  kelas: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaIbu: string;
  alamat: string;
}

export interface FastingRecordItem {
  studentId: number;
  status: FastingStatus;
  notes?: string;
  updatedAt?: string;
}

export interface FastingSession {
  id: string; // unique identifier e.g. "puasa-senin-2026-08-27"
  title: string; // e.g. "Puasa Senin 27 Agustus 2026"
  date: string; // ISO YYYY-MM-DD format
  records: Record<number, FastingRecordItem>; // studentId -> status info
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verifierNotes?: string;
  createdById?: string;
  updatedAt?: string;
}

export type UserRole = 'penginput' | 'pengecek';

export interface UserSession {
  username: string;
  role: UserRole;
  name: string;
}
