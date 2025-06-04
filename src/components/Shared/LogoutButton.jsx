import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100"
    >
      Logout
    </button>
  );
}

export default LogoutButton;