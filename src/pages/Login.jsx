// Fix errors on Login
import { useState, useEffect, useCallback } from 'react';
import { FcGoogle } from 'react-icons/fc';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase-config';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, Info } from 'lucide-react';
import background from '../assets/bg.jpeg';
import PropTypes from 'prop-types';

const Login = ({ setShowSignUp }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  /* ----------  VALIDATION  ---------- */
  const validateForm = useCallback(() => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /* ----------  HANDLE INPUT  ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear errors
    if (error) {
      setError('');
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /* ----------  HANDLE EMAIL/PASSWORD LOGIN  ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 1. Wait for Sign in to finish
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('✅ Login successful');
      // 2. Navigate immediately
      navigate('/home');
    } catch (err) {
      console.log('Firebase Error Code:', err.code);
      console.log('Firebase Error Message:', err.message);
      console.log('Full Error:', err);

      const errorMessage = getFirebaseErrorMessage(err.code);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------  HANDLE GOOGLE LOGIN  ---------- */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('✅ Google login initiated');

      // ✅ Wait for Auth state to finalize before navigation
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('✅ Google Auth confirmed:', user.uid);
          navigate('/home');
        }
      });
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err.code);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------  HANDLE FIREBASE ERRORS  ---------- */
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid email or password';

      case 'auth/invalid-email':
        return 'Please enter a valid email address';

      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';

      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';

      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';

      default:
        return 'An error occurred. Please try again.';
    }
  };

  /* ----------  UI  ---------- */
  return (
    <div
      className="flex items-center justify-center h-screen text-center p-5"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${background})`,
        backgroundSize: 'cover',
      }}>
      <div>
        <div className="w-full bg-indigo-50 border-b border-indigo-200 p-3 flex justify-center items-center gap-2 text-indigo-800 text-sm shadow-sm mb-2 mt-2">
          <Info className="h-4 w-4" />
          <p>
            <strong>Demo Login:</strong> guest@example.com{' '}
            <span className="mx-2 text-indigo-300">|</span>
            <strong>Password:</strong> Guest123
          </p>
        </div>
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
          <div>
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            )}
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please sign in to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.email
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Email address"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password input */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <FcGoogle className="h-5 w-5 mr-2" />
            Sign in with Google
          </button>

          {/* Sign-up Link */}
          <p className="mt-2 text-center text-sm text-gray-600">
            {"Don't have an account?"}
            <button
              onClick={() => setShowSignUp(true)}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  setShowSignUp: PropTypes.func.isRequired,
};
export default Login;
