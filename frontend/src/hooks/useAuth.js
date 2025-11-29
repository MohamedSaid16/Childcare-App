import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Additional auth-related utilities
export const useAuthUtils = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user can access a specific feature
  const canAccess = (feature) => {
    if (!isAuthenticated) return false;
    
    const featurePermissions = {
      'view_dashboard': true, // All authenticated users can view dashboard
      'manage_children': ['parent', 'admin'].includes(user?.role),
      'manage_attendance': ['employee', 'admin'].includes(user?.role),
      'manage_activities': ['employee', 'admin'].includes(user?.role),
      'manage_payments': ['parent', 'admin'].includes(user?.role),
      'manage_users': user?.role === 'admin',
      'view_reports': ['employee', 'admin'].includes(user?.role),
      'system_settings': user?.role === 'admin'
    };

    return featurePermissions[feature] || false;
  };

  // Get user's display name
  const getDisplayName = () => {
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`;
  };

  // Get user's initials for avatar
  const getInitials = () => {
    if (!user) return 'G';
    return `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`.toUpperCase();
  };

  // Check if user has any of the given roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Check if user is the owner of a resource
  const isResourceOwner = (resourceUserId) => {
    if (!user) return false;
    return user.id === resourceUserId;
  };

  // Get user's role-based color scheme
  const getRoleColorScheme = () => {
    const colorSchemes = {
      parent: {
        primary: 'green',
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
        hover: 'hover:bg-green-100'
      },
      employee: {
        primary: 'blue',
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100'
      },
      admin: {
        primary: 'purple',
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100'
      }
    };

    return colorSchemes[user?.role] || colorSchemes.parent;
  };

  return {
    canAccess,
    getDisplayName,
    getInitials,
    hasAnyRole,
    isResourceOwner,
    getRoleColorScheme
  };
};

export default useAuth;