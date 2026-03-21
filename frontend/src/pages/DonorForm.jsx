import { useState } from 'react';
import axios from 'axios';
import { Share, MapPin, Clock, Info } from 'lucide-react';

export default function DonorForm() {
  const [formData, setFormData] = useState({
    food_type: 'veg',
    quantity: 10,
    expiry_time: 5,
    latitude: 40.7128,
    longitude: -74.0060,
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('Submitting...');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/donations`, formData);
      setStatus('Donation submitted successfully!');
      setFormData({...formData, quantity: 10, expiry_time: 5});
    } catch (err) {
      console.error(err);
      setStatus('Failed to submit. Is backend running?');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 shadow-xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Share className="text-primary" /> Donate Surplus Food
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Food Type</label>
              <select 
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={formData.food_type}
                onChange={(e) => setFormData({...formData, food_type: e.target.value})}
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Quantity (People)</label>
              <input 
                type="number" min="1"
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4"/> Expiry Time (Hours)
            </label>
            <input 
              type="number" min="1" max="72"
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={formData.expiry_time}
              onChange={(e) => setFormData({...formData, expiry_time: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className="bg-dark-900 p-4 rounded-lg flex gap-3 text-sm text-gray-400 border border-dark-700">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <p>For MVP, location is set automatically. In full version, this uses browser Geolocation or a Map Picker.</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-orange-600 transition-colors mt-4"
          >
            Submit Donation
          </button>
          
          {status && (
            <div className={`p-4 rounded-lg text-center font-medium ${status.includes('success') ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
