import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-dark-800 border-b border-dark-700 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
        <Utensils className="h-6 w-6" />
        <span>RescueBite</span>
      </Link>
      <div className="flex gap-6 items-center flex-wrap">
        <Link to="/donate" className="hover:text-primary transition-colors font-medium">Donate Food</Link>
        <Link to="/request" className="hover:text-red-500 transition-colors font-medium text-red-400">Request Food</Link>
        <Link to="/volunteer" className="hover:text-primary transition-colors font-medium">Volunteer</Link>
        <Link to="/heatmap" className="bg-primary/20 text-primary border border-primary/50 px-4 py-1.5 rounded-full hover:bg-primary/30 transition-colors font-medium text-sm">
          Live Heatmap
        </Link>
      </div>
    </nav>
  );
}
