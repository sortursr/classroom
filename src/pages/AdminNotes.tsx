import { useEffect, useState, type FormEvent } from 'react'
import {
  subscribeNotes,
  subscribeStudents,
  addNote,
  deleteNote,
  markNoteSent,
  getStudentContact,
  type Note,
  type Student,
} from '../lib/data'
import { upcomingWeeks, formatWeek } from '../lib/weeks'
import { sendToRecipients } from '../lib/emailjs'

export default function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [weekId, setWeekId] = useState(upcomingWeeks(1)[0].weekId)
  const [error, setError] = useState<string | null>(null)
  const [sendStatus, setSendStatus] = useState<Record<string, string>>({})

  useEffect(() => subscribeNotes(setNotes), [])
  useEffect(() => subscribeStudents(setStudents), [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setError(null)
    try {
      await addNote({ title: title.trim(), body: body.trim(), weekId })
      setTitle('')
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save note.')
    }
  }

  async function onSend(note: Note) {
    setSendStatus({ ...sendStatus, [note.id]: 'Sending…' })
    try {
      const activeStudents = students.filter((s) => s.active)
      const contacts = await Promise.all(activeStudents.map((s) => getStudentContact(s.id)))
      const recipients = activeStudents
        .map((s, i) => ({ name: s.name, email: contacts[i].email }))
        .filter((r): r is { name: string; email: string } => !!r.email)

      if (recipients.length === 0) {
        setSendStatus({ ...sendStatus, [note.id]: 'No students have an email on file.' })
        return
      }

      const { sent, failed } = await sendToRecipients(recipients, note.title, note.body)
      await markNoteSent(note.id)
      setSendStatus({
        ...sendStatus,
        [note.id]: failed.length ? `Sent to ${sent}, failed for ${failed.map((f) => f.name).join(', ')}` : `Sent to ${sent} student(s).`,
      })
    } catch (err) {
      setSendStatus({ ...sendStatus, [note.id]: err instanceof Error ? err.message : 'Send failed.' })
    }
  }

  return (
    <div>
      <div className="card">
        <h2>New Note / Reminder</h2>
        <form onSubmit={onCreate}>
          <label htmlFor="week">For which Sunday?</label>
          <select id="week" value={weekId} onChange={(e) => setWeekId(e.target.value)}>
            {upcomingWeeks(8).map((w) => (
              <option key={w.weekId} value={w.weekId}>
                {formatWeek(w.weekId)}
              </option>
            ))}
          </select>
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label htmlFor="body">Message</label>
          <textarea id="body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <div style={{ marginTop: 12 }}>
            <button type="submit">Save Note</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Posted Notes</h2>
        {notes.length === 0 && <p className="muted">Nothing posted yet.</p>}
        {notes.map((n) => (
          <div key={n.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong>{n.title}</strong>
              <span className="muted">{formatWeek(n.weekId)}</span>
            </div>
            <p className="note-body">{n.body}</p>
            <p className="muted">{n.sentAt ? 'Emailed to students.' : 'Not sent yet.'}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => onSend(n)}>Send Email</button>
              <button className="danger" onClick={() => deleteNote(n.id)}>
                Delete
              </button>
            </div>
            {sendStatus[n.id] && <p className="muted">{sendStatus[n.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
