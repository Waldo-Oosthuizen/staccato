import { useNavigate } from 'react-router-dom';
import calendarImage from '../assets/calendar-bro.svg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="text-4xl md:text-5xl font-bold text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Attendance, Simplified.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A clean, intuitive way to track and manage students.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-8 px-6 py-3 bg-black text-white text-lg rounded-lg hover:bg-emerald-600 transition">
            Get Started / Login
          </button>
        </div>

        {/* Right: Image */}
        <div className="w-full flex justify-center">
          <img
            src={calendarImage}
            alt="Calendar illustration"
            className="w-full max-w-md"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white text-center py-4 text-sm">
        © 2026 Staccato by Waldo Oosthuizen
      </footer>
    </div>
  );
};

export default Landing;
