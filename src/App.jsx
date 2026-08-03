import { useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Home from './pages/Dash';
import Students from './pages/Students';
import StudentManagement from './pages/StudentManagement';
import HomeWork from './pages/HomeWork';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import AttendanceHistory from './pages/AttendanceHistory';
import PrivateRoute from './routes/PrivateRoute'; // Importing a custom `PrivateRoute` component to restrict access to protected routes

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase-config';
import { useEffect } from 'react';

import Landing from './pages/Landing';

const App = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return null; // or a loading spinner
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" /> : <Landing />}
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" />
            ) : showSignUp ? (
              <SignUp setShowSignUp={setShowSignUp} />
            ) : (
              <Login setShowSignUp={setShowSignUp} />
            )
          }
        />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/students"
          element={
            <PrivateRoute>
              <Students />
            </PrivateRoute>
          }
        />

        <Route
          path="/StudentManagement"
          element={
            <PrivateRoute>
              <StudentManagement />
            </PrivateRoute>
          }></Route>

        <Route
          path="/attendance/:studentId"
          element={
            <PrivateRoute>
              <AttendanceHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/homework/:studentId"
          element={
            <PrivateRoute>
              <HomeWork />
            </PrivateRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <PrivateRoute>
              <Schedule />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
