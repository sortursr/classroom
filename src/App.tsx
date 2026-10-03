import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Nav from './components/Nav'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import ReaderSignup from './pages/ReaderSignup'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminStudents from './pages/AdminStudents'
import AdminNotes from './pages/AdminNotes'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Nav />
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reader-signup" element={<ReaderSignup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin/students"
              element={
                <AdminRoute>
                  <AdminStudents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/notes"
              element={
                <AdminRoute>
                  <AdminNotes />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </HashRouter>
    </AuthProvider>
  )
}
