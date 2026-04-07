import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Map, ArrowRight, Zap, IndianRupee, Activity, Users, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import HowItWorksSlider from '../components/HowItWorksSlider';
import TopDonors from '../components/TopDonors';

export default function Home() {
  const [stats, setStats] = useState({ total_meals_delivered: 0, active_requests: 0, people_helped: 0, total_money_donated: 0 });
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    axios.get(`${API_URL}/stats`).then(res => setStats(res.data)).catch(console.error);
  }, []);

  const handleQuickHelp = async () => {
    try {
      const res = await axios.post(`${API_URL}/quick-help`, { amount_inr: 500, user_id: user?.id || null });
      toast.success(`You instantly donated ₹500! Generated ${res.data.meals_generated} meals for the most urgent request.`);
      axios.get(`${API_URL}/stats`).then(res => setStats(res.data)).catch(console.error);
    } catch(err) {
      toast.error('Failed to process quick help');
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Rescue Surplus Food. <br />
          <span className="text-primary">Feed the Hungry.</span>
        </h1>
        <p className="text-xl text-gray-400">
          AI-Powered Food Rescue & Hunger Heatmap Platform. Connect donors with volunteers to distribute food efficiently to areas that need it most.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 pt-8">
          <Link to="/donate" className="flex items-center gap-2 bg-dark-800 border border-dark-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-dark-700 transition-all">
            <HeartHandshake className="h-5 w-5" /> Donate Food
          </Link>
          <Link to="/donate-money" className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <IndianRupee className="h-5 w-5" /> Donate Money
          </Link>
          <Link to="/heatmap" className="flex items-center gap-2 bg-dark-800 border border-dark-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-dark-700 transition-all">
            <Map className="h-5 w-5" /> View Heatmap
          </Link>
        </div>

        <div className="mt-6">
          <button onClick={handleQuickHelp} className="flex mx-auto items-center gap-2 bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Zap className="h-5 w-5" /> Help Instantly (₹500 Auto-Donate)
          </button>
        </div>
      </div>
      
      {/* IMPACT VISUALIZATION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
        <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl text-center">
          <Utensils className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-3xl font-extrabold">{stats.total_meals_delivered}</p>
          <p className="text-gray-400 text-sm mt-1">Meals Delivered</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl text-center">
          <Activity className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-3xl font-extrabold">{stats.active_requests}</p>
          <p className="text-gray-400 text-sm mt-1">Active Requests</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-3xl font-extrabold">{stats.people_helped}</p>
          <p className="text-gray-400 text-sm mt-1">People Helped</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl text-center">
          <IndianRupee className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-3xl font-extrabold">₹{stats.total_money_donated}</p>
          <p className="text-gray-400 text-sm mt-1">Total Donated</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-32">
        {[
          { title: "For Donors", desc: "List surplus food from restaurants, events, or hostels quickly before it expires.", link: "/donate", label: "Start Donating" },
          { title: "For Volunteers", desc: "Get AI-prioritized routes to rescue food and deliver it to high-hunger zones.", link: "/volunteer", label: "View Tasks" },
          { title: "Hunger Heatmap", desc: "Real-time AI visualization of hunger levels helps target delivery areas efficiently.", link: "/heatmap", label: "Explore Map" }
        ].map((feature, idx) => (
          <div key={idx} className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-primary/50 transition-colors group">
            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-400 mb-6">{feature.desc}</p>
            <Link to={feature.link} className="flex items-center gap-2 text-primary font-medium group-hover:translate-x-1 transition-transform">
              {feature.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
      
      <HowItWorksSlider />
      <TopDonors />
    </div>
  );
}
