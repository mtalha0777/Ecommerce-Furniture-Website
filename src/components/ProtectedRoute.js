import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('authToken');
  
  if (!token || isTokenExpired(token)) {
    // Clear any auth data before redirecting
    sessionStorage.clear();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 