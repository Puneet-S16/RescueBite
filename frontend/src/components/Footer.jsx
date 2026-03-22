import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-dark-700 pt-16 pb-8 text-gray-400 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            RescueBite
          </h3>
          <p className="text-sm">
            AI-powered food rescue and distribution platform fighting hunger with optimized delivery routing.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/heatmap" className="hover:text-primary transition-colors">Hunger Heatmap</Link></li>
            <li><Link to="/donate" className="hover:text-primary transition-colors">Donate Food</Link></li>
            <li><Link to="/volunteer" className="hover:text-primary transition-colors">Volunteer Dashboard</Link></li>
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Community</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Impact Report</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Connect</h4>
          <ul className="space-y-2 text-sm mb-6">
            <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
          </ul>
          <div className="flex gap-4">
            <a href="https://github.com/Puneet-S16" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#0077b5] transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs">
        <p>&copy; {new Date().getFullYear()} RescueBite. All rights reserved.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-1">
          Built with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by <a href="https://github.com/Puneet-S16" className="text-primary hover:underline">Puneet-S16</a>
        </p>
      </div>
    </footer>
  );
}
