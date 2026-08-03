// Settings.js
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';

const Settings = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('You have been successfully signed out!');
      navigate('/');
    } catch (error) {
      console.error('Logout Failed:', error.message);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 md:ml-16 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="border-t pt-6">
        <button
          onClick={handleLogout}
          className="bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-600 transition">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
