// Importing required dependencies and modules
import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'; // Firebase functions for user sign-up and Google authentication
import { auth, googleProvider } from '../config/firebase-config'; // Firebase authentication and Google provider configuration
import { FcGoogle } from 'react-icons/fc'; // React icon for Google logo used in the Google sign-up button
import { Eye, EyeOff, Loader } from 'lucide-react'; // Icons for password visibility toggle and a loading spinner
import background from '../assets/bg.jpeg'; // Background image for the Sign-Up page

// SignUp component
const SignUp = ({ setShowSignUp }) => {
  // State to manage user input for the form
  const [formData, setFormData] = useState({ email: '', password: '' }); // Stores email and password inputs
  const [validationErrors, setValidationErrors] = useState({}); // Tracks validation errors for each field
  const [error, setError] = useState(''); // Tracks errors related to Firebase or other issues
  const [isLoading, setIsLoading] = useState(false); // Tracks the loading state for API requests
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility in the input field

  // Function to validate the form fields
  const validateForm = useCallback(() => {
    const errors = {}; // Object to collect validation errors
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex pattern for validating email format

    // Check if the email field is empty or invalid
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        'Password must be at least 8 characters and include an uppercase letter, lowercase letter, and number.';
    }
    setValidationErrors(errors); // Update validation errors state
    return Object.keys(errors).length === 0; // Return true if no validation errors
  }, [formData]);

  // Handle input changes in the form fields
  const handleChange = (e) => {
    const { name, value } = e.target; // Extract input field name and value
    setFormData((prev) => ({ ...prev, [name]: value })); // Update the corresponding field in the formData state
    // Clear errors
    if (error) {
      setError('');
    }

    // Clear validation error for the field being updated
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle sign-up using email and password
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Validate the form before proceeding
    if (!validateForm()) return;

    setIsLoading(true); // Start the loading spinner
    try {
      // Use Firebase to create a new user with email and password
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      setFormData({ email: '', password: '' }); // Reset the form inputs on successful sign-up
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err.code); // Convert Firebase error code to a user-friendly message
      setError(errorMessage); // Display the error message
    } finally {
      setIsLoading(false); // Stop the loading spinner
    }
  };

  // Handle sign-up using Google
  const handleGoogleSignUp = async () => {
    setIsLoading(true); // Start the loading spinner
    try {
      // Use Firebase to sign in with Google
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err.code); // Convert Firebase error code to a user-friendly message
      setError(errorMessage); // Display the error message
    } finally {
      setIsLoading(false); // Stop the loading spinner
    }
  };

  // Convert Firebase error codes into user-friendly error messages
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Google sign up was cancelled.';
      default:
        return 'An error occurred. Please try again.'; // Generic error message
    }
  };

  // Return JSX structure for the Sign-Up page
  return (
    <div
      // Outer container with a full-screen background image and centered content
      className="flex items-center justify-center h-screen text-center p-5"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${background})`, // Overlay to darken the background image
        backgroundSize: 'cover', // Ensure the image covers the entire container
      }}>
      <div className="max-w-md w-full space-y-8 bg-white  p-8 rounded-xl shadow-2xl">
        {/* Page title */}
        <div>
          {/* Display error messages */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Up
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign up to continue
          </p>
        </div>

        {/* Sign-up form */}
        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          {/* Email input field */}
          <div className="space-y-4">
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className={`appearance-none relative block w-full px-3 py-2 border ${
                validationErrors.email ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm">{validationErrors.email}</p>
            )}
          </div>

          {/* Password input field */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} // Toggle password visibility
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`appearance-none relative block w-full px-3 py-2 border ${
                validationErrors.password ? 'border-red-500' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
            />
            {/* Button to toggle password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {validationErrors.password ? (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.password}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              At least 8 characters, 1 uppercase, 1 lowercase and 1 number.
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading} // Disable the button while loading
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (
              <Loader className="animate-spin mx-auto" /> // Show loading spinner if isLoading is true
            ) : (
              'Sign Up'
            )}
          </button>
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

        {/* Google sign-up button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          <FcGoogle className="h-5 w-5 mr-2" />
          Sign Up with Google
        </button>

        {/* Link to switch to login */}
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => setShowSignUp(false)} // Call function to switch to login page
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

// Prop Validation
SignUp.propTypes = {
  setShowSignUp: PropTypes.func.isRequired,
};

// Exporting the SignUp component for use in other parts of the app
export default SignUp;
