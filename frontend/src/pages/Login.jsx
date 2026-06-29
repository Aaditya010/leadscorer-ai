import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      const token = response.data.access_token;
      localStorage.setItem('access_token', token);
      localStorage.setItem('username', username);
      toast.success('Login successful!');

      window.location.href = '/';
      
    } catch (error) {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <div className="relative w-full max-w-2xl 2xl:max-w-3xl bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Welcome Back</h1>
          <p className="text-white/80 text-sm mt-1">Sign in to your LeadScorer AI account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition text-white placeholder-white/50"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition text-white placeholder-white/50"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-black/20"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-white/80">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;