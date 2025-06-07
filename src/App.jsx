import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Shared/Navbar';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import EventsPage from './pages/User/EventsPage';
import AttendeesPage from './pages/User/AttendeesPage';
import ScanPage from './pages/User/ScanPage';
import ProfilePage from './pages/User/ProfilePage';
import AdminEventsPage from './pages/Admin/AdminEventsPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminStatisticsPage from './pages/Admin/AdminStatisticsPage';

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
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/statistics" element={<AdminStatisticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;