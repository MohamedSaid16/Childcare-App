import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  logout: () => api.get('/auth/logout'),
};

// Parent API
export const parentAPI = {
  getMyChildren: () => api.get('/parent/children'),
  registerChild: (childData) => api.post('/parent/children', childData),
  getChildAttendance: (childId) => api.get(`/parent/children/${childId}/attendance`),
  getChildActivities: (childId) => api.get(`/parent/children/${childId}/activities`),
  getMyPayments: () => api.get('/parent/payments'),
  makePayment: (paymentId, paymentData) => api.post(`/parent/payments/${paymentId}/pay`, paymentData),
};

// Employee API
export const employeeAPI = {
  getMyClassroom: () => api.get('/employee/classroom'),
  getClassroomChildren: () => api.get('/employee/classroom/children'),
  recordActivity: (activityData) => api.post('/employee/activities', activityData),
  getMyActivities: () => api.get('/employee/activities'),
  addChildNote: (noteData) => api.post('/employee/child-notes', noteData),
  getChildNotes: (childId) => api.get(`/employee/child-notes?childId=${childId}`),
  reportMedicalAlert: (alertData) => api.post('/employee/medical-alerts', alertData),
};

// Attendance API
export const attendanceAPI = {
  checkIn: (checkInData) => api.post('/attendance/checkin', checkInData),
  checkOut: (attendanceId, checkOutData) => api.put(`/attendance/checkout/${attendanceId}`, checkOutData),
  getTodayAttendance: () => api.get('/attendance/today'),
  updateAttendance: (attendanceId, updateData) => api.put(`/attendance/${attendanceId}`, updateData),
};

// Payment API
export const paymentAPI = {
  getInvoices: () => api.get('/payments'),
  generateInvoices: (invoiceData) => api.post('/payments/generate', invoiceData),
  updateInvoice: (invoiceId, updateData) => api.put(`/payments/${invoiceId}`, updateData),
  processPayment: (paymentId, paymentData) => api.post(`/payments/${paymentId}/process`, paymentData),
};

// Notification API
export const notificationAPI = {
  getMyNotifications: (params) => api.get('/notifications/my-notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

export default api;