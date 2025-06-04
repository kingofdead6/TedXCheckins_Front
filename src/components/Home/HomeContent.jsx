import { Link } from 'react-router-dom';

function HomeContent() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to TEDx Check-ins</h1>
      <p className="text-lg mb-6">Manage your events and attendees with ease.</p>
      <Link to="/events" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        View Events
      </Link>
    </div>
  );
}

export default HomeContent;