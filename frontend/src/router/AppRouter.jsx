import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotificationsPage from '../pages/NotificationsPage';

// Parent Pages
import ParentDashboard from '../pages/parent/ParentDashboard';
import TrackChild from '../pages/parent/TrackChild';
import RegisterChild from '../pages/parent/RegisterChild';
import ParentMessages from '../pages/parent/ParentMessages';
import ParentProfile from '../pages/parent/ParentProfile';
import ParentPayments from '../pages/parent/ParentPayments';
import ChildDailyReport from '../pages/parent/ChildDailyReport';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import AttendancePage from '../pages/employee/AttendancePage';
import DailyActivities from '../pages/employee/DailyActivities';
import ChildNotes from '../pages/employee/ChildNotes';
import EmployeeProfile from '../pages/employee/EmployeeProfile';
import MedicalAlertsPage from '../pages/employee/MedicalAlertsPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageParents from '../pages/admin/ManageParents';
import ManageEmployees from '../pages/admin/ManageEmployees';
import ManageChildren from '../pages/admin/ManageChildren';
import ManagePayments from '../pages/admin/ManagePayments';
import ManageClasses from '../pages/admin/ManageClasses';
import AdminReports from '../pages/admin/AdminReports';
import CapacityManagement from '../pages/admin/CapacityManagement';

const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    
    switch (user?.role) {
      case 'parent':
        return '/parent/dashboard';
      case 'employee':
        return '/employee/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />
      } />

      {/* Parent Routes */}
      <Route path="/parent/dashboard" element={
        <ProtectedRoute requiredRole="parent">
          <ParentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/parent/track-child" element={
        <ProtectedRoute requiredRole="parent">
          <TrackChild />
        </ProtectedRoute>
      } />
      <Route path="/parent/register-child" element={
        <ProtectedRoute requiredRole="parent">
          <RegisterChild />
        </ProtectedRoute>
      } />
      <Route path="/parent/messages" element={
        <ProtectedRoute requiredRole="parent">
          <ParentMessages />
        </ProtectedRoute>
      } />
      <Route path="/parent/profile" element={
        <ProtectedRoute requiredRole="parent">
          <ParentProfile />
        </ProtectedRoute>
      } />
      <Route path="/parent/payments" element={
        <ProtectedRoute requiredRole="parent">
          <ParentPayments />
        </ProtectedRoute>
      } />
      <Route path="/parent/daily-report" element={
        <ProtectedRoute requiredRole="parent">
          <ChildDailyReport />
        </ProtectedRoute>
      } />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee/attendance" element={
        <ProtectedRoute requiredRole="employee">
          <AttendancePage />
        </ProtectedRoute>
      } />
      <Route path="/employee/activities" element={
        <ProtectedRoute requiredRole="employee">
          <DailyActivities />
        </ProtectedRoute>
      } />
      <Route path="/employee/child-notes" element={
        <ProtectedRoute requiredRole="employee">
          <ChildNotes />
        </ProtectedRoute>
      } />
      <Route path="/employee/profile" element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeProfile />
        </ProtectedRoute>
      } />
      <Route path="/employee/medical-alerts" element={
        <ProtectedRoute requiredRole="employee">
          <MedicalAlertsPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-parents" element={
        <ProtectedRoute requiredRole="admin">
          <ManageParents />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-employees" element={
        <ProtectedRoute requiredRole="admin">
          <ManageEmployees />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-children" element={
        <ProtectedRoute requiredRole="admin">
          <ManageChildren />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-payments" element={
        <ProtectedRoute requiredRole="admin">
          <ManagePayments />
        </ProtectedRoute>
      } />
      <Route path="/admin/manage-classes" element={
        <ProtectedRoute requiredRole="admin">
          <ManageClasses />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRole="admin">
          <AdminReports />
        </ProtectedRoute>
      } />
      <Route path="/admin/capacity" element={
        <ProtectedRoute requiredRole="admin">
          <CapacityManagement />
        </ProtectedRoute>
      } />

      {/* Common Routes */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

export default AppRouter;