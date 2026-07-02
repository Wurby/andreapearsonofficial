import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

import Home from './pages/Home'
import About from './pages/About'
import AboutGenre from './pages/AboutGenre'
import Books from './pages/Books'
import BookGenre from './pages/BookGenre'
import BookDetail from './pages/BookDetail'
import Newsletter from './pages/Newsletter'
import WorkWithMe from './pages/WorkWithMe'
import SeriesDetail from './pages/SeriesDetail'
import NotFound from './pages/NotFound'

import AdminLogin from './admin/pages/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminBooks from './admin/pages/AdminBooks'
import AdminBookForm from './admin/pages/AdminBookForm'
import AdminGenres from './admin/pages/AdminGenres'
import AdminSeries from './admin/pages/AdminSeries'
import AdminTheme from './admin/pages/AdminTheme'
import AdminContent from './admin/pages/AdminContent'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="books/new" element={<AdminBookForm />} />
              <Route path="books/:id/edit" element={<AdminBookForm />} />
              <Route path="genres" element={<AdminGenres />} />
              <Route path="series" element={<AdminSeries />} />
              <Route path="theme" element={<AdminTheme />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="analytics" element={<Navigate to="/admin" replace />} />
            </Route>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/about/:genre" element={<AboutGenre />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:genre" element={<BookGenre />} />
              <Route path="/books/:genre/series/:seriesId" element={<SeriesDetail />} />
              <Route path="/books/:genre/:id" element={<BookDetail />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/work-with-me" element={<WorkWithMe />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
