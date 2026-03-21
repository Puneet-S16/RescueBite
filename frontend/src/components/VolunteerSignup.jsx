import { useState } from 'react';
import axios from 'axios';
import { UserPlus, Truck } from 'lucide-react';

export default function VolunteerSignup({ onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    volunteer_type: 'Individual',
    contact: '',
    vehicle_availability: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${API_URL}/volunteers`, formData);
      // Pass the volunteer ID back to parent
      onComplete(res.data);
    } catch (err) {
      console.error("Failed to register volunteer", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-73px)] p-6 bg-dark-900">
      <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <UserPlus className="text-primary" /> Volunteer Details
        </h2>
        <p className="text-gray-400 text-sm mb-6">Please provide your details before accessing the live task dashboard. This helps us coordinate delivery partners.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input type="text" required className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contact (Phone/Email)</label>
            <input type="text" required className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 outline-none"
              onChange={(e) => setFormData({...formData, contact: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Role Type</label>
            <select className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 outline-none"
              onChange={(e) => setFormData({...formData, volunteer_type: e.target.value})}>
              <option value="Individual">Individual Volunteer</option>
              <option value="NGO">NGO Representative</option>
            </select>
          </div>

          <div className="flex border border-dark-700 rounded-lg p-4 mt-2 bg-dark-900 items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, vehicle_availability: !formData.vehicle_availability})}>
            <div className="flex flex-col">
              <span className="font-medium flex items-center gap-2"><Truck className="w-4 h-4"/> Transport Vehicle?</span>
              <span className="text-xs text-gray-400">Can you act as a Delivery Partner?</span>
            </div>
            <input type="checkbox" checked={formData.vehicle_availability} readOnly className="w-5 h-5 accent-primary" />
          </div>

          <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mt-6">
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
