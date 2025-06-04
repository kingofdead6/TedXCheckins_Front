import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/events"
          className="p-4 bg-white rounded shadow text-center hover:bg-gray-100"
        >
          <h3 className="text-xl font-bold">Manage Events</h3>
          <p>Create, edit, or delete events</p>
        </Link>
        <Link
          to="/admin/users"
          className="p-4 bg-white rounded shadow text-center hover:bg-gray-100"
        >
          <h3 className="text-xl font-bold">Manage Users</h3>
          <p>View or remove users</p>
        </Link>
        <Link
          to="/admin/statistics"
          className="p-4 bg-white rounded shadow text-center hover:bg-gray-100"
        >
          <h3 className="text-xl font-bold">Statistics</h3>
          <p>View event and platform statistics</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboardPage;