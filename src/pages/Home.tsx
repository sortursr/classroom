import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeStudents, subscribeNotes, subscribeReaderSchedule, type Student, type Note, type ReaderSignup } from '../lib/data'
import { upcomingWeeks, formatWeek } from '../lib/weeks'

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [signups, setSignups] = useState<Record<string, ReaderSignup>>({})

  const weeks = upcomingWeeks(4)
  const weekIds = weeks.map((w) => w.weekId)

  useEffect(() => subscribeStudents(setStudents), [])
  useEffect(() => subscribeNotes(setNotes), [])
  useEffect(() => subscribeReaderSchedule(weekIds, setSignups), [weekIds.join(',')])

  const thisWeek = weeks[0]
  const thisWeekSignup = signups[thisWeek.weekId]

  return (
    <div>
      <div className="card">
        <h2>This Sunday — {formatWeek(thisWeek.weekId)}</h2>
        {thisWeekSignup ? (
          <p>
            Reader of the week: <strong>{thisWeekSignup.studentName}</strong>
          </p>
        ) : (
          <p>
            No reader signed up yet.{' '}
            <Link to="/reader-signup">Volunteer to read this Sunday »</Link>
          </p>
        )}
      </div>

      <div className="card">
        <h2>Upcoming Readers</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reader</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.weekId}>
                <td>{formatWeek(w.weekId)}</td>
                <td>
                  {signups[w.weekId] ? (
                    signups[w.weekId].studentName
                  ) : (
                    <span className="pill open">Open</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Latest Notes &amp; Reminders</h2>
        {notes.length === 0 && <p className="muted">Nothing posted yet.</p>}
        {notes.slice(0, 5).map((n) => (
          <div key={n.id} style={{ marginBottom: 16 }}>
            <strong>{n.title}</strong> <span className="muted">— {formatWeek(n.weekId)}</span>
            <p className="note-body">{n.body}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Students</h2>
        {students.length === 0 && <p className="muted">No students added yet.</p>}
        <ul>
          {students.map((s) => (
            <li key={s.id}>
              {s.name}
              {!s.active && <span className="muted"> (inactive)</span>}
            </li>
          ))}
        </ul>
        <p className="muted">Contact information is private and only visible to the admin.</p>
      </div>
    </div>
  )
}
