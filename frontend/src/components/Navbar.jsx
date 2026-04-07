import { Link, useNavigate } from 'react-router-dom';
import { Utensils, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
        <Utensils className="h-6 w-6" />
        <span>RescueBite</span>
      </Link>
      <div className="flex gap-5 items-center flex-wrap">
        <Link to="/donate" className="hover:text-primary transition-colors font-medium text-sm">Donate Food</Link>
        <Link to="/donate-money" className="hover:text-primary transition-colors font-medium text-sm">Donate Money</Link>
        <Link to="/request" className="hover:text-red-400 transition-colors font-medium text-sm text-red-400">Request Food</Link>
        <Link to="/volunteer" className="hover:text-primary transition-colors font-medium text-sm">Volunteer</Link>
        <Link to="/heatmap" className="bg-primary/20 text-primary border border-primary/50 px-3 py-1.5 rounded-full hover:bg-primary/30 transition-colors font-medium text-xs">
          Live Heatmap
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 font-medium flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" /> Hi, {user.name.split(' ')[0]} 👋
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors border border-dark-600 px-3 py-1.5 rounded-full hover:border-red-500/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="flex items-center gap-1.5 bg-white/10 hover:bg-primary hover:text-white transition-all text-white font-bold text-xs px-4 py-2 rounded-full border border-white/20">
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

