import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Shared/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import AttendeesPage from './pages/AttendeesPage';
import ScanPage from './pages/ScanPage';
import ProfilePage from './pages/ProfilePage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStatisticsPage from './pages/AdminStatisticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId/attendees" element={<AttendeesPage />} />
          <Route path="/events/:eventId/scan" element={<ScanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;