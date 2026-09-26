import { useEffect, useState, type FormEvent } from 'react'
import {
  subscribeStudents,
  addStudent,
  setStudentActive,
  removeStudent,
  getStudentContact,
  setStudentContact,
  type Student,
  type StudentContact,
} from '../lib/data'

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [contacts, setContacts] = useState<Record<string, StudentContact>>({})
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftContact, setDraftContact] = useState<StudentContact>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => subscribeStudents(setStudents), [])

  useEffect(() => {
    let cancelled = false
    Promise.all(students.map(async (s) => [s.id, await getStudentContact(s.id)] as const)).then((entries) => {
      if (!cancelled) setContacts(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [students])

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setError(null)
    try {
      await addStudent(newName.trim())
      setNewName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add student.')
    }
  }

  function startEdit(s: Student) {
    setEditingId(s.id)
    setDraftContact(contacts[s.id] ?? {})
  }

  async function saveContact(id: string) {
    setError(null)
    try {
      await setStudentContact(id, draftContact)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save contact info.')
    }
  }

  async function onRemove(s: Student) {
    if (!confirm(`Remove ${s.name} from the roster? This also deletes their contact info.`)) return
    await removeStudent(s.id)
  }

  return (
    <div>
      <div className="card">
        <h2>Add Student</h2>
        <form onSubmit={onAdd} className="form-row">
          <input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button type="submit">Add</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card table-scroll">
        <h2>Roster ({students.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Active</th>
              <th>Contact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  <input type="checkbox" checked={s.active} onChange={(e) => setStudentActive(s.id, e.target.checked)} />
                </td>
                <td>
                  {editingId === s.id ? (
                    <div>
                      <input
                        type="email"
                        placeholder="email"
                        value={draftContact.email ?? ''}
                        onChange={(e) => setDraftContact({ ...draftContact, email: e.target.value })}
                        style={{ marginBottom: 6 }}
                      />
                      <input
                        type="tel"
                        placeholder="phone"
                        value={draftContact.phone ?? ''}
                        onChange={(e) => setDraftContact({ ...draftContact, phone: e.target.value })}
                      />
                      <div style={{ marginTop: 6 }}>
                        <button onClick={() => saveContact(s.id)}>Save</button>{' '}
                        <button className="secondary" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="muted">{contacts[s.id]?.email || '—'}</div>
                      <div className="muted">{contacts[s.id]?.phone || '—'}</div>
                      <button className="secondary" onClick={() => startEdit(s)}>
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <button className="danger" onClick={() => onRemove(s)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
