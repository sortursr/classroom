import { NavLink } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, isAdmin, loading } = useAuth()

  return (
    <nav className="top-nav">
      <span className="brand">Classroom</span>
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/reader-signup">Volunteer to Read</NavLink>
      {isAdmin && <NavLink to="/admin/students">Manage Students</NavLink>}
      {isAdmin && <NavLink to="/admin/notes">Notes &amp; Reminders</NavLink>}
      {!loading && !user && <NavLink to="/login">Log In</NavLink>}
      {!loading && !user && <NavLink to="/register">Register</NavLink>}
      {!loading && user && (
        <button className="secondary" onClick={() => signOut(auth)}>
          Log Out ({user.email})
        </button>
      )}
    </nav>
  )
}
