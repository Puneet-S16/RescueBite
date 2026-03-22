import { Link } from 'react-router-dom';
import { HeartHandshake, Map, ArrowRight } from 'lucide-react';
import HowItWorksSlider from '../components/HowItWorksSlider';

export default function Home() {
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
        
        <div className="flex justify-center gap-4 pt-8">
          <Link to="/donate" className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <HeartHandshake className="h-5 w-5" /> Donate Now
          </Link>
          <Link to="/heatmap" className="flex items-center gap-2 bg-dark-800 border border-dark-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-dark-700 transition-all">
            <Map className="h-5 w-5" /> View Heatmap
          </Link>
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
    </div>
  );
}
