import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { RequireAuth, RequirePermission } from './routes/guards';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Placeholder } from './pages/Placeholder';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/students"
          element={
            <RequirePermission permission="student:read">
              <Placeholder title="Students" />
            </RequirePermission>
          }
        />
        <Route
          path="/staff"
          element={
            <RequirePermission permission="staff:read">
              <Placeholder title="Staff" />
            </RequirePermission>
          }
        />
        <Route
          path="/academics"
          element={
            <RequirePermission permission="academic:manage">
              <Placeholder title="Academics" />
            </RequirePermission>
          }
        />
        <Route
          path="/attendance"
          element={
            <RequirePermission permission="attendance:read">
              <Placeholder title="Attendance" />
            </RequirePermission>
          }
        />
        <Route
          path="/examinations"
          element={
            <RequirePermission permission="marks:read">
              <Placeholder title="Examinations" />
            </RequirePermission>
          }
        />
        <Route
          path="/finance"
          element={
            <RequirePermission permission="finance:read">
              <Placeholder title="Finance" />
            </RequirePermission>
          }
        />
        <Route
          path="/library"
          element={
            <RequirePermission permission="library:borrow">
              <Placeholder title="Library" />
            </RequirePermission>
          }
        />
        <Route
          path="/transport"
          element={
            <RequirePermission permission="transport:manage">
              <Placeholder title="Transport" />
            </RequirePermission>
          }
        />
        <Route
          path="/settings"
          element={
            <RequirePermission permission="settings:manage">
              <Placeholder title="Settings" />
            </RequirePermission>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
