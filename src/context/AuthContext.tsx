import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

interface AuthState {
  user: User | null
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, isAdmin: false, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u?.email) {
        try {
          const snap = await getDoc(doc(db, 'config', 'admins'))
          const emails: string[] = snap.exists() ? snap.data().emails ?? [] : []
          setIsAdmin(emails.includes(u.email))
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
  }, [])

  return <AuthContext.Provider value={{ user, isAdmin, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
