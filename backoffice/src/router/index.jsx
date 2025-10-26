import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Variables from '../pages/Variables';
import Prizes from '../pages/Prizes';
import Users from '../pages/Users';
import Stats from '../pages/Stats';
import UserDataPage from '../pages/UserData';
import Categories from '../pages/Categories';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/variables"
            element={
              <ProtectedRoute>
                <Variables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prizes"
            element={
              <ProtectedRoute>
                <Prizes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userdata"
            element={
              <ProtectedRoute>
                <UserDataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;