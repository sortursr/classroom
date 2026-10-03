import { useEffect, useState } from 'react'
import {
  subscribeStudents,
  subscribeReaderSchedule,
  claimReaderSlot,
  clearReaderSlot,
  type Student,
  type ReaderSignup as ReaderSignupDoc,
} from '../lib/data'
import { upcomingWeeks, formatWeek } from '../lib/weeks'
import { useAuth } from '../context/AuthContext'

const WEEKS_SHOWN = 8

export default function ReaderSignup() {
  const { user, isAdmin } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [signups, setSignups] = useState<Record<string, ReaderSignupDoc>>({})
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [busyWeek, setBusyWeek] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const weeks = upcomingWeeks(WEEKS_SHOWN)
  const weekIds = weeks.map((w) => w.weekId)
  const activeStudents = students.filter((s) => s.active)

  useEffect(() => subscribeStudents(setStudents), [])
  useEffect(() => subscribeReaderSchedule(weekIds, setSignups), [weekIds.join(',')])

  async function volunteer(weekId: string) {
    const studentId = selected[weekId]
    const student = activeStudents.find((s) => s.id === studentId)
    if (!student) {
      setError('Pick a name from the list first.')
      return
    }
    setError(null)
    setBusyWeek(weekId)
    try {
      await claimReaderSlot(weekId, student.id, student.name, user?.uid ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign up — someone may have just taken this slot.')
    } finally {
      setBusyWeek(null)
    }
  }

  async function cancel(weekId: string) {
    setBusyWeek(weekId)
    try {
      await clearReaderSlot(weekId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel.')
    } finally {
      setBusyWeek(null)
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Volunteer to Read</h2>
        <p className="muted">
          Pick your name from the list to claim an open Sunday. No login required to sign up.
        </p>
        {error && <p className="error">{error}</p>}
      </div>

      {weeks.map((w) => {
        const signup = signups[w.weekId]
        const canManage = !!signup && (isAdmin || (user && signup.signedUpByUid === user.uid))
        return (
          <div className="card" key={w.weekId}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <strong>{formatWeek(w.weekId)}</strong>
              {signup ? <span className="pill">{signup.studentName}</span> : <span className="pill open">Open</span>}
            </div>

            {!signup && (
              <div className="form-row" style={{ marginTop: 12 }}>
                <select
                  value={selected[w.weekId] ?? ''}
                  onChange={(e) => setSelected({ ...selected, [w.weekId]: e.target.value })}
                >
                  <option value="">Select your name…</option>
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button disabled={busyWeek === w.weekId} onClick={() => volunteer(w.weekId)}>
                  {busyWeek === w.weekId ? 'Signing up…' : "I'll read"}
                </button>
              </div>
            )}

            {canManage && (
              <div style={{ marginTop: 12 }}>
                <button className="danger" disabled={busyWeek === w.weekId} onClick={() => cancel(w.weekId)}>
                  Cancel sign-up
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
