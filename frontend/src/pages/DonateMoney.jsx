import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Utensils, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DonateMoney() {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const mealsGenerated = amount ? Math.floor(parseInt(amount) / 20) : 0;

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || parseInt(amount) < 20) {
      toast.error('Please donate at least ₹20 (1 meal)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/donate-money`, {
        amount_inr: parseInt(amount),
        user_id: user?.id || null,
        target_request_id: null
      });
      toast.success(`Thank you! ₹${amount} donated successfully. You provided ${res.data.meals_generated} meals!`, { duration: 5000 });
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Failed to process donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-20 min-h-[calc(100vh-73px)] flex flex-col justify-center">
      <div className="bg-dark-800 p-8 rounded-3xl border border-dark-700 shadow-2xl relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 flex items-center justify-center rounded-2xl mb-4 border border-primary/30 text-primary">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Donate Money</h2>
          <p className="text-gray-400">Convert your money directly into meals for the hungriest zones.</p>
        </div>

        <form onSubmit={handleDonate} className="space-y-6 relative z-10">
          <div>
            <label className="block text-gray-400 font-medium mb-2">How much would you like to donate?</label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
              <input 
                type="number"
                min="20"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
          </div>

          {amount && parseInt(amount) >= 20 && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <p className="text-green-400 font-bold text-xl">{mealsGenerated} Meals</p>
                <p className="text-green-500/80 text-sm">Will be immediately generated and allocated.</p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-bold text-xl py-4 rounded-xl hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Processing...' : `Donate ₹${amount || '0'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
