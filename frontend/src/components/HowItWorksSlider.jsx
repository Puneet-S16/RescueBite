import { useState, useEffect } from 'react';

const slides = [
  {
    title: "1. Rescue Food",
    description: "Restaurants, events, and individuals list their surplus high-quality food seamlessly before it expires.",
    image: import.meta.env.BASE_URL + "slides/slide1.png"
  },
  {
    title: "2. Smart Routing",
    description: "Volunteers receive AI-optimized routes directing them exactly to where the food is needed most.",
    image: import.meta.env.BASE_URL + "slides/slide2.png"
  },
  {
    title: "3. Feed Communities",
    description: "Hot, nutritious meals are successfully delivered to communities and individuals in high-hunger zones.",
    image: import.meta.env.BASE_URL + "slides/slide3.png"
  }
];

export default function HowItWorksSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-dark-800 py-16 border-y border-dark-700 my-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12">How RescueBite <span className="text-primary">Operates</span></h2>
        
        <div className="flex flex-col md:flex-row items-center gap-12 bg-dark-900 rounded-2xl p-8 border border-dark-700 shadow-xl overflow-hidden relative min-h-[400px]">
          {/* Text Section */}
          <div className="flex-1 space-y-6 z-10 w-full">
            {slides.map((slide, idx) => (
              <div 
                key={idx} 
                className={`transition-all duration-500 cursor-pointer ${current === idx ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-4 hover:opacity-70'} border-l-4 ${current === idx ? 'border-primary' : 'border-transparent'} pl-6`}
                onClick={() => setCurrent(idx)}
              >
                <h3 className={`text-2xl font-bold ${current === idx ? 'text-white' : 'text-gray-400'}`}>{slide.title}</h3>
                {current === idx && (
                  <p className="text-gray-300 mt-2 text-lg animate-fade-in">{slide.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Image Section */}
          <div className="flex-1 w-full h-[300px] md:h-[400px] relative rounded-xl overflow-hidden shadow-2xl border border-dark-700">
            {slides.map((slide, idx) => (
              <img 
                key={idx}
                src={slide.image} 
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${current === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
