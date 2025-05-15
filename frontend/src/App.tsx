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

import JobTitleListPage from './pages/job-titles/list-page';
import JobTitleAddPage from './pages/job-titles/create-page';
import JobTitleUpdatePage from './pages/job-titles/update-page';

import EmploymentStatusListPage from './pages/employment-status/list-page';
import EmploymentStatusAddPage from './pages/employment-status/create-page';
import EmploymentStatusUpdatePage from './pages/employment-status/update-page';

import EmployeeListPage from './pages/employees/list-page';
import EmployeeAddPage from './pages/employees/create-page';
import EmployeeUpdatePage from './pages/employees/update-page';
import AdminPage from './pages/admin/admin-page';

import TrainingListPage from './pages/trainings/list-page';
import TrainingAddPage from './pages/trainings/create-page';
import TrainingUpdatePage from './pages/trainings/update-page';

import LeaveTypeListPage from './pages/leave-types/list-page';
import LeaveTypeAddPage from './pages/leave-types/create-page';
import LeaveTypeUpdatePage from './pages/leave-types/update-page';

import BenefitListPage from './pages/benefits/list-page';
import BenefitAddPage from './pages/benefits/create-page';
import BenefitUpdatePage from './pages/benefits/update-page';

import PayrollListPage from './pages/payroll/list-page';
import PayrollAddPage from './pages/payroll/create-page';
import PayrollUpdatePage from './pages/payroll/update-page';

import PayLimitListPage from './pages/paylimits/list-page';
import PayLimitAddPage from './pages/paylimits/create-page';
import PayLimitUpdatePage from './pages/paylimits/update-page';

import LeaveRequestListPage from './pages/leave/list-page';
import LeaveRequestAddPage from './pages/leave/create-page';
import LeaveRequestUpdatePage from './pages/leave/update-page';

import LeaveReviewListPage from './pages/leave/leave-review';
import LeaveCalendarPage from './pages/leave/leave-calendar';

import HomePage from './pages/home/index';


function AppContent() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="HR" />}>
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

            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/add" element={<EmployeeAddPage />} />
            <Route path="/employees/edit/:id" element={<EmployeeUpdatePage />} />

            <Route path="/trainings" element={<TrainingListPage />} />
            <Route path="/trainings/add" element={<TrainingAddPage />} />
            <Route path="/trainings/edit/:id" element={<TrainingUpdatePage />} />

            <Route path="/leave-types" element={<LeaveTypeListPage />} />
            <Route path="/leave-types/add" element={<LeaveTypeAddPage />} />
            <Route path="/leave-types/edit/:id" element={<LeaveTypeUpdatePage />} />

            <Route path="/benefits" element={<BenefitListPage />} />
            <Route path="/benefits/add" element={<BenefitAddPage />} />
            <Route path="/benefits/edit/:id" element={<BenefitUpdatePage />} />

            <Route path="/payrolls" element={<PayrollListPage />} />
            <Route path="/payrolls/add" element={<PayrollAddPage />} />
            <Route path="/payrolls/edit/:id" element={<PayrollUpdatePage />} />

            <Route path="/leave-reviews" element={<LeaveReviewListPage />} />
            <Route path="/leave-calendar" element={<LeaveCalendarPage />} />
            
            <Route path="/paylimits" element={<PayLimitListPage />} />
            <Route path="/paylimits/add" element={<PayLimitAddPage />} />
            <Route path="/paylimits/add/:departmentId" element={<PayLimitAddPage />} />
            <Route path="/paylimits/edit/:id" element={<PayLimitUpdatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="Employee" />}>
            <Route path="/leaves" element={<LeaveRequestListPage />} />
            <Route path="/leaves/add" element={<LeaveRequestAddPage />} />
            <Route path="/leaves/edit/:id" element={<LeaveRequestUpdatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route path="/admin" element={<AdminPage />} />
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
