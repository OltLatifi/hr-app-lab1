import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import LoginPage from './pages/login-page';
import RegisterPage from './pages/register-page';
import ProtectedRoute from './components/protected-route';

const HomePage: React.FC = () => {
  const { user, logout } = useAuthStore(state => ({
    user: state.user,
    logout: state.logout
  }));

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>You are logged in.</p>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

function AppContent() {
  // const { isAuthenticated } = useAuthStore(state => ({isAuthenticated: state.isAuthenticated}));

  return (
    <Router>

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
