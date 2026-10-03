import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading, user } = useAuth()

  if (loading) return <p className="muted">Loading…</p>
  if (!user) return <p>You need to log in to view this page.</p>
  if (!isAdmin) return <p>Only the classroom admin can access this page.</p>
  return <>{children}</>
}
