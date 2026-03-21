import { useState } from 'react';
import axios from 'axios';
import { Send, MapPin, AlertCircle, Info } from 'lucide-react';

export default function RequestForm() {
  const [formData, setFormData] = useState({
    requester_type: 'NGO',
    name: '',
    contact: '',
    latitude: 40.7128,
    longitude: -74.0060,
    required_quantity: 100,
    urgency_level: 'medium',
  });
  const [status, setStatus] = useState('');
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude}));
          setLocating(false);
        },
        () => setLocating(false)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('Submitting...');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/requests`, formData);
      setStatus('Food Request submitted successfully!');
      setFormData({...formData, name: '', contact: '', required_quantity: 100});
    } catch (err) {
      setStatus('Failed to submit request.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 shadow-xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" /> Request Food Relief
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Requester Type</label>
              <select 
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                value={formData.requester_type}
                onChange={(e) => setFormData({...formData, requester_type: e.target.value})}
              >
                <option value="NGO">NGO / Shelter</option>
                <option value="Individual">Individual / Community</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Urgency Level</label>
              <select 
                className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                value={formData.urgency_level}
                onChange={(e) => setFormData({...formData, urgency_level: e.target.value})}
              >
                <option value="low">Low (Next 24-48h)</option>
                <option value="medium">Medium (Next 12-24h)</option>
                <option value="high">High (Immediate Need)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Organization / Name</label>
              <input 
                type="text" className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Contact Details</label>
              <input 
                type="text" className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
                value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Meals Required (Quantity)</label>
            <input 
              type="number" min="1"
              className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white outline-none"
              value={formData.required_quantity} onChange={(e) => setFormData({...formData, required_quantity: parseInt(e.target.value)})} required
            />
          </div>

          <div className="bg-dark-900 p-4 rounded-lg flex items-center justify-between border border-dark-700">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4"/> Delivery Location</p>
              <p className="font-medium text-white">{formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
            </div>
            <button type="button" onClick={getLocation} className="px-4 py-2 bg-dark-700 rounded-lg text-sm hover:bg-dark-600 transition-colors">
              {locating ? 'Locating...' : 'Update GPS'}
            </button>
          </div>

          <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors mt-4 flex justify-center items-center gap-2">
            <Send className="w-5 h-5"/> Submit Request
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
