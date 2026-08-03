import { useNavigate } from 'react-router-dom'; // Import useNavigate hook from react-router-dom for navigation
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Users, Calendar, Settings, User } from 'lucide-react';
import PropTypes from 'prop-types';

const DashboardCard = ({
  title,
  description,
  onClick,
  bgColor = 'bg-white',
  icon: Icon,
}) => (
  <button
    onClick={onClick} // Attach click handler to navigate or execute actions
    className={`${bgColor} group rounded-lg p-6 shadow-lg transition-all duration-200 w-full text-left hover:bg-gray-50 `}>
    <div className="flex flex-col space-y-3 px-5">
      {Icon && (
        <div className="w-10 h-10 bg-gradient-to-r from-[#00C853] to-[#009624] rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      {/* Title of the card */}
      <h3 className="text-xl font-bold ">{title}</h3>
      {/* Description of the card */}
      <p className="text-gray-600 text-sm">{description}</p>
      <div className="mt-4 flex items-center text-emerald-900 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span>View Details</span>
        <svg
          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  </button>
);

// Prop Validation
DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClick: PropTypes.func, // Validates the function
  bgColor: PropTypes.string,
  icon: PropTypes.elementType, // "elementType" is used for components/icons
};
/**
 * DashboardBanner Component
 * Displays a banner at the top of the dashboard with a welcome message.
 */
const DashboardBanner = () => (
  <div className="relative  lg:ml-18 md:ml-20 flex mb-4 bg-white/70 backdrop-blur-xl border-b border-gray-200 sticky top-0 ">
    {/* Tailwind classes:
     */}
    <div className="p-4 flex-col">
      {/* Welcome message content */}
      <h1 className="text-2xl font-bold mb-2 ">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">
        {"Welcome back! Here's what's happening today."}
      </p>
    </div>
    <div className="flex items-center gap-3 ml-auto mr-10"></div>
  </div>
);

/**
 * Home Component
 * Serves as the main dashboard page containing the banner and a grid of dashboard cards.
 */
const Home = () => {
  const navigate = useNavigate(); // useNavigate hook for programmatic navigation
  const [studentCount, setStudentCount] = useState(0);
  const [todayStudents, setTodayStudents] = useState('');

  // Fetch students and count
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // get current date
      const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
      }).format(new Date());

      const q = query(
        collection(db, 'students'),
        where('ownerId', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      setStudentCount(snapshot.size);

      const studentsToday = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((student) => student.day === today)
        .sort((a, b) => (a.visitTime || '').localeCompare(b.visitTime || ''));

      setTodayStudents(studentsToday);
    });

    return unsubscribe;
  }, []);

  // Define dashboard items (title, description, action, and styling)
  const dashboardItems = [
    {
      title: 'Student Profiles', // Title of the card
      description: 'Edit and add student profiles', // Description of the card
      onClick: () => navigate('/students'), // Navigate to the "students" page on click
      icon: User,
    },
    {
      title: 'Manage Students',
      description: 'Mark attendance and assign homework',
      onClick: () => navigate('/studentManagement'), // Navigate to the "attendance" page on click
      icon: Users,
    },
    {
      title: 'Teaching Calendar',
      description: 'View your teaching calendar',
      onClick: () => navigate('/schedule'), // Navigate to the "schedule" page on click
      icon: Calendar,
    },
    {
      title: 'Settings',
      description: 'Manage your preferences and profile settings',
      onClick: () => navigate('/settings'), // or open modal
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden bg-cover bg-center">
      <DashboardBanner />
      <main className="lg:pl-18 md:pl-20 pb-24 lg:pb-8">
        {/* Grid container for dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardItems.map((item, index) => (
            <DashboardCard
              key={index} // Unique key for each card
              title={item.title} // Pass title prop
              description={item.description} // Pass description prop
              onClick={item.onClick} // Pass onClick handler
              bgColor={item.bgColor} // Pass background color class
              icon={item.icon}
            />
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {"Today's Lessons"}
            </h2>

            {todayStudents.length > 0
              ? todayStudents.map((st) => <div key={st.id}></div>)
              : ''}
            <div className="space-y-4">
              {todayStudents.length > 0 ? (
                todayStudents.map((student, index) => (
                  <div
                    key={student.id || index}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Status indicator - changes color if they have an instrument set */}
                    <div
                      className={`w-2 h-2 ${
                        student.instrument ? 'bg-emerald-500' : 'bg-gray-300'
                      } rounded-full`}></div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {student.name} –{' '}
                        {student.instrument || 'General Lesson'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Scheduled for {student.visitTime} ({student.duration}{' '}
                        min)
                      </p>
                    </div>

                    {/* Quick link to their specific homework page */}
                    <button
                      onClick={() =>
                        navigate(`/homework/${student.id}`, {
                          state: { student },
                        })
                      }
                      className="text-xs text-white bg-amber-600 rounded-md p-2 hover:bg-amber-700">
                      View Homework
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 italic">
                  No lessons scheduled for today.
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {studentCount}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Classes Today</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {todayStudents.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; // Export the Home component as default
