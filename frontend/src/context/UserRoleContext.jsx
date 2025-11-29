import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserRoleContext = createContext();

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

export const UserRoleProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [features, setFeatures] = useState([]);

  // Define role-based permissions
  const rolePermissions = {
    parent: {
      canViewChildren: true,
      canRegisterChildren: true,
      canViewAttendance: true,
      canViewActivities: true,
      canMakePayments: true,
      canViewReports: false,
      canManageUsers: false,
      canManageSystem: false,
      canManageClasses: false,
      canRecordActivities: false,
      canCheckInOut: false,
      canViewAllChildren: false,
      canGenerateReports: false
    },
    employee: {
      canViewChildren: true,
      canRegisterChildren: false,
      canViewAttendance: true,
      canViewActivities: true,
      canMakePayments: false,
      canViewReports: true,
      canManageUsers: false,
      canManageSystem: false,
      canManageClasses: false,
      canRecordActivities: true,
      canCheckInOut: true,
      canViewAllChildren: true,
      canGenerateReports: true
    },
    admin: {
      canViewChildren: true,
      canRegisterChildren: true,
      canViewAttendance: true,
      canViewActivities: true,
      canMakePayments: true,
      canViewReports: true,
      canManageUsers: true,
      canManageSystem: true,
      canManageClasses: true,
      canRecordActivities: true,
      canCheckInOut: true,
      canViewAllChildren: true,
      canGenerateReports: true
    }
  };

  // Define role-based features
  const roleFeatures = {
    parent: [
      'dashboard',
      'child_management',
      'attendance_tracking',
      'activity_viewing',
      'payment_processing',
      'messaging',
      'notifications'
    ],
    employee: [
      'dashboard',
      'attendance_management',
      'activity_recording',
      'child_notes',
      'medical_alerts',
      'classroom_view',
      'reports_view'
    ],
    admin: [
      'dashboard',
      'user_management',
      'child_management',
      'attendance_management',
      'activity_management',
      'payment_management',
      'class_management',
      'report_generation',
      'system_settings',
      'billing_management'
    ]
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      // Set permissions based on user role
      setPermissions(rolePermissions[user.role] || {});
      
      // Set features based on user role
      setFeatures(roleFeatures[user.role] || []);
    } else {
      // Reset for unauthenticated users
      setPermissions({});
      setFeatures([]);
    }
  }, [user, isAuthenticated]);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  // Check if user has any of the given permissions
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => permissions[permission]);
  };

  // Check if user has all of the given permissions
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(permission => permissions[permission]);
  };

  // Check if feature is available for user
  const hasFeature = (feature) => {
    return features.includes(feature);
  };

  // Get available features for current user
  const getAvailableFeatures = () => {
    return features;
  };

  // Get user's role display name
  const getRoleDisplayName = () => {
    const roleNames = {
      parent: 'Parent',
      employee: 'Employee',
      admin: 'Administrator'
    };
    return roleNames[user?.role] || 'User';
  };

  // Get role color for UI
  const getRoleColor = () => {
    const roleColors = {
      parent: 'text-green-600 bg-green-100',
      employee: 'text-blue-600 bg-blue-100',
      admin: 'text-purple-600 bg-purple-100'
    };
    return roleColors[user?.role] || 'text-gray-600 bg-gray-100';
  };

  // Check if user can access a specific route
  const canAccessRoute = (route) => {
    const routePermissions = {
      '/parent/dashboard': ['canViewChildren'],
      '/parent/track-child': ['canViewAttendance'],
      '/parent/register-child': ['canRegisterChildren'],
      '/parent/payments': ['canMakePayments'],
      '/employee/dashboard': ['canViewChildren'],
      '/employee/attendance': ['canCheckInOut'],
      '/employee/activities': ['canRecordActivities'],
      '/admin/dashboard': ['canViewReports'],
      '/admin/manage-parents': ['canManageUsers'],
      '/admin/manage-children': ['canManageUsers'],
      '/admin/manage-employees': ['canManageUsers'],
      '/admin/manage-classes': ['canManageClasses'],
      '/admin/reports': ['canGenerateReports']
    };

    const requiredPermissions = routePermissions[route] || [];
    return hasAllPermissions(requiredPermissions);
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const allMenuItems = {
      parent: [
        { path: '/parent/dashboard', label: 'Dashboard', icon: '📊', permission: 'canViewChildren' },
        { path: '/parent/track-child', label: 'Track Child', icon: '👶', permission: 'canViewAttendance' },
        { path: '/parent/register-child', label: 'Register Child', icon: '➕', permission: 'canRegisterChildren' },
        { path: '/parent/payments', label: 'Payments', icon: '💳', permission: 'canMakePayments' },
        { path: '/parent/messages', label: 'Messages', icon: '💬', permission: 'canViewChildren' }
      ],
      employee: [
        { path: '/employee/dashboard', label: 'Dashboard', icon: '📊', permission: 'canViewChildren' },
        { path: '/employee/attendance', label: 'Attendance', icon: '✅', permission: 'canCheckInOut' },
        { path: '/employee/activities', label: 'Activities', icon: '🎨', permission: 'canRecordActivities' },
        { path: '/employee/child-notes', label: 'Child Notes', icon: '📝', permission: 'canRecordActivities' },
        { path: '/employee/medical-alerts', label: 'Medical Alerts', icon: '🏥', permission: 'canRecordActivities' }
      ],
      admin: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊', permission: 'canViewReports' },
        { path: '/admin/manage-parents', label: 'Manage Parents', icon: '👨‍👩‍👧‍👦', permission: 'canManageUsers' },
        { path: '/admin/manage-children', label: 'Manage Children', icon: '👶', permission: 'canManageUsers' },
        { path: '/admin/manage-employees', label: 'Manage Employees', icon: '👨‍💼', permission: 'canManageUsers' },
        { path: '/admin/manage-classes', label: 'Manage Classes', icon: '🏫', permission: 'canManageClasses' },
        { path: '/admin/manage-payments', label: 'Manage Payments', icon: '💳', permission: 'canMakePayments' },
        { path: '/admin/reports', label: 'Reports', icon: '📈', permission: 'canGenerateReports' },
        { path: '/admin/capacity', label: 'Capacity', icon: '📊', permission: 'canManageSystem' }
      ]
    };

    const userMenuItems = allMenuItems[user?.role] || [];
    return userMenuItems.filter(item => hasPermission(item.permission));
  };

  // Get quick actions based on user role
  const getQuickActions = () => {
    const quickActions = {
      parent: [
        { action: 'registerChild', label: 'Register New Child', icon: '👶', permission: 'canRegisterChildren' },
        { action: 'makePayment', label: 'Make Payment', icon: '💳', permission: 'canMakePayments' },
        { action: 'viewAttendance', label: 'View Attendance', icon: '📊', permission: 'canViewAttendance' }
      ],
      employee: [
        { action: 'checkIn', label: 'Check In Child', icon: '✅', permission: 'canCheckInOut' },
        { action: 'recordActivity', label: 'Record Activity', icon: '🎨', permission: 'canRecordActivities' },
        { action: 'addNote', label: 'Add Child Note', icon: '📝', permission: 'canRecordActivities' }
      ],
      admin: [
        { action: 'generateReport', label: 'Generate Report', icon: '📈', permission: 'canGenerateReports' },
        { action: 'manageUsers', label: 'Manage Users', icon: '👥', permission: 'canManageUsers' },
        { action: 'systemSettings', label: 'System Settings', icon: '⚙️', permission: 'canManageSystem' }
      ]
    };

    const userActions = quickActions[user?.role] || [];
    return userActions.filter(action => hasPermission(action.permission));
  };

  // Check if user can perform a specific action on a resource
  const canPerformAction = (resource, action) => {
    const actionPermissions = {
      child: {
        view: 'canViewChildren',
        create: 'canRegisterChildren',
        edit: 'canManageUsers',
        delete: 'canManageUsers'
      },
      attendance: {
        view: 'canViewAttendance',
        create: 'canCheckInOut',
        edit: 'canCheckInOut',
        delete: 'canManageSystem'
      },
      activity: {
        view: 'canViewActivities',
        create: 'canRecordActivities',
        edit: 'canRecordActivities',
        delete: 'canManageSystem'
      },
      payment: {
        view: 'canMakePayments',
        create: 'canMakePayments',
        edit: 'canManageSystem',
        delete: 'canManageSystem'
      },
      user: {
        view: 'canViewChildren',
        create: 'canManageUsers',
        edit: 'canManageUsers',
        delete: 'canManageUsers'
      }
    };

    const permission = actionPermissions[resource]?.[action];
    return permission ? hasPermission(permission) : false;
  };

  const value = {
    // Current user info
    currentRole: user?.role,
    roleDisplayName: getRoleDisplayName(),
    roleColor: getRoleColor(),
    
    // Permission checks
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Feature checks
    features,
    hasFeature,
    getAvailableFeatures,
    
    // Navigation
    canAccessRoute,
    getMenuItems,
    getQuickActions,
    
    // Action checks
    canPerformAction,
    
    // Role-specific configurations
    isParent: user?.role === 'parent',
    isEmployee: user?.role === 'employee',
    isAdmin: user?.role === 'admin'
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};