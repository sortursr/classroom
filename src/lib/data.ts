import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export interface Student {
  id: string
  name: string
  active: boolean
  createdAt?: Timestamp
}

export interface StudentContact {
  email?: string
  phone?: string
}

export interface Note {
  id: string
  title: string
  body: string
  weekId: string
  createdAt?: Timestamp
  sentAt?: Timestamp | null
}

export interface ReaderSignup {
  weekId: string
  studentId: string
  studentName: string
  signedUpAt?: Timestamp
  signedUpByUid: string | null
}

// ---- Students (public: name only) ----

export function subscribeStudents(cb: (students: Student[]) => void) {
  const q = query(collection(db, 'students'), orderBy('name'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Student, 'id'>) })))
  })
}

export async function addStudent(name: string) {
  const ref = await addDoc(collection(db, 'students'), {
    name,
    active: true,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function setStudentActive(id: string, active: boolean) {
  await updateDoc(doc(db, 'students', id), { active })
}

export async function removeStudent(id: string) {
  await deleteDoc(doc(db, 'students', id))
  await deleteDoc(doc(db, 'studentContacts', id)).catch(() => {})
}

// ---- Student contacts (admin-only read/write) ----

export async function getStudentContact(id: string): Promise<StudentContact> {
  const snap = await getDoc(doc(db, 'studentContacts', id))
  return snap.exists() ? (snap.data() as StudentContact) : {}
}

export async function setStudentContact(id: string, contact: StudentContact) {
  await setDoc(doc(db, 'studentContacts', id), contact, { merge: true })
}

// ---- Notes & reminders (public read, admin write) ----

export function subscribeNotes(cb: (notes: Note[]) => void) {
  const q = query(collection(db, 'notes'), orderBy('weekId', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Note, 'id'>) })))
  })
}

export async function addNote(note: { title: string; body: string; weekId: string }) {
  await addDoc(collection(db, 'notes'), { ...note, createdAt: serverTimestamp(), sentAt: null })
}

export async function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'weekId'>>) {
  await updateDoc(doc(db, 'notes', id), patch)
}

export async function deleteNote(id: string) {
  await deleteDoc(doc(db, 'notes', id))
}

export async function markNoteSent(id: string) {
  await updateDoc(doc(db, 'notes', id), { sentAt: serverTimestamp() })
}

// ---- Reader-of-the-week schedule (public read; open create if slot is free, admin can override) ----

export function subscribeReaderSchedule(weekIds: string[], cb: (signups: Record<string, ReaderSignup>) => void) {
  const q = query(collection(db, 'readerSchedule'), where('weekId', 'in', weekIds.slice(0, 30)))
  return onSnapshot(q, (snap) => {
    const byWeek: Record<string, ReaderSignup> = {}
    snap.docs.forEach((d) => {
      byWeek[d.id] = d.data() as ReaderSignup
    })
    cb(byWeek)
  })
}

export async function claimReaderSlot(weekId: string, studentId: string, studentName: string, uid: string | null) {
  await setDoc(doc(db, 'readerSchedule', weekId), {
    weekId,
    studentId,
    studentName,
    signedUpAt: serverTimestamp(),
    signedUpByUid: uid,
  })
}

export async function clearReaderSlot(weekId: string) {
  await deleteDoc(doc(db, 'readerSchedule', weekId))
}
