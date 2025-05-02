import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import LoginPage from './pages/auth/login-page';
import RegisterPage from './pages/auth/register-page';
import ProtectedRoute from './components/protected-route';

import DepartmentListPage from './pages/department/list-page';
import DepartmentAddPage from './pages/department/create-page';
import DepartmentUpdatePage from './pages/department/update-page';

import JobTitleListPage from './pages/jobtitles/list-page';
import JobTitleAddPage from './pages/jobtitles/create-page';
import JobTitleUpdatePage from './pages/jobtitles/update-page';

import EmploymentStatusListPage from './pages/employmentstatus/list-page';
import EmploymentStatusAddPage from './pages/employmentstatus/create-page';
import EmploymentStatusUpdatePage from './pages/employmentstatus/update-page';


const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome!</h1>
      <p>This is your protected home page.</p>
    </div>
  );
};

function AppContent() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/departments" element={<DepartmentListPage />} />
            <Route path="/departments/add" element={<DepartmentAddPage />} />
            <Route path="/departments/edit/:id" element={<DepartmentUpdatePage />} />

            <Route path="/jobtitles" element={<JobTitleListPage />} />
            <Route path="/jobtitles/add" element={<JobTitleAddPage />} />
            <Route path="/jobtitles/edit/:id" element={<JobTitleUpdatePage />} />

            <Route path="/employment-statuses" element={<EmploymentStatusListPage />} />
            <Route path="/employment-statuses/add" element={<EmploymentStatusAddPage />} />
            <Route path="/employment-statuses/edit/:id" element={<EmploymentStatusUpdatePage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
