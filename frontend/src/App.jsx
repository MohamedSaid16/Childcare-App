import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserRoleProvider } from './context/UserRoleContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRouter from './router/AppRouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationBell from './components/notifications/NotificationBell';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserRoleProvider>
          <NotificationProvider>
            <div className="App flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-1 pt-16"> {/* Add padding for fixed navbar */}
                <AppRouter />
              </div>
              <Footer />
            </div>
          </NotificationProvider>
        </UserRoleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;