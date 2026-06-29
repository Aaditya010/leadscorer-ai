import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Link, Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Signup from './pages/Signup';


function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}


function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username'); 
    if (storedUsername) setUsername(storedUsername);
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (loading) {
    return null;
  }


  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    );
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 h-screen flex flex-col sticky top-0">
  <h2 className="text-2xl font-bold mb-8">LeadScorer AI</h2>

  <nav className="flex-1 overflow-y-auto">
    <ul className="space-y-4">
      <li>
        <Link to="/" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
          📊 Dashboard
        </Link>
      </li>
      <li>
        <Link to="/leads" className="block py-2 px-4 hover:bg-gray-700 rounded transition">
          👤 Leads
        </Link>
      </li>
    </ul>
  </nav>

  <div className="mt-auto pt-4 border-t border-gray-700 flex-shrink-0">
    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Logged in as</p>
    <p className="text-white font-medium mb-3 truncate">{username || 'User'}</p>
    <button
      onClick={handleLogout}
      className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition text-sm font-medium"
    >
      Logout
    </button>
  </div>
</aside>

      <main className="flex-1 p-8">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;