import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown, Utensils } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BADGE_THRESHOLDS = [
  { min: 1000, label: 'Legend', color: 'text-yellow-400', icon: Crown },
  { min: 500,  label: 'Champion', color: 'text-orange-400', icon: Trophy },
  { min: 100,  label: 'Hero', color: 'text-blue-400', icon: Medal },
];

function getBadge(meals) {
  for (const b of BADGE_THRESHOLDS) {
    if (meals >= b.min) return b;
  }
  return null;
}

export default function TopDonors() {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/top-donors`).then(res => setDonors(res.data)).catch(console.error);
  }, []);

  if (donors.length === 0) return (
    <section className="mt-24 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white">Thanks to Our Donors ❤️</h2>
        <p className="text-gray-400 mt-2">These incredible people are fighting hunger one meal at a time.</p>
      </div>
      <div className="bg-dark-800 border border-dark-700 rounded-2xl p-12 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-gray-400 text-lg font-medium">Be the first donor on the leaderboard!</p>
        <p className="text-gray-500 text-sm mt-2">Make a food or money donation to appear here.</p>
      </div>
    </section>
  );

  return (
    <section className="mt-24 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-white">Thanks to Our Donors ❤️</h2>
        <p className="text-gray-400 mt-2">These incredible people are fighting hunger one meal at a time.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {donors.map((donor, idx) => {
          const badge = getBadge(donor.total_meals);
          const BadgeIcon = badge?.icon;
          return (
            <div
              key={idx}
              className={`relative bg-dark-800 border rounded-2xl p-6 flex flex-col items-center text-center group hover:scale-105 transition-all duration-300
                ${idx === 0 ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'border-dark-700 hover:border-primary/30'}`}
            >
              {idx === 0 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  🔥 Top Contributor
                </div>
              )}

              {/* Avatar */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-3 
                ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : idx === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-500/30'
                  : 'bg-orange-700/20 text-orange-400 border border-orange-700/30'}`}>
                {donor.name.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-lg font-bold text-white">{donor.name}</h3>
              <span className="text-xs font-medium text-gray-500 bg-dark-900 px-2 py-0.5 rounded-full mt-1">{donor.user_type}</span>

              <div className="flex items-center gap-2 mt-4 text-primary font-bold text-xl">
                <Utensils className="w-5 h-5" />
                {donor.total_meals.toLocaleString()} Meals
              </div>

              {badge && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${badge.color}`}>
                  <BadgeIcon className="w-3 h-3" /> {badge.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
