import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Login from '@/pages/Login';
import ProtectedRoute from '@/lib/ProtectedRoute';
import ClientContentManager from '@/pages/ClientContentManager';
import Bookings from '@/pages/Bookings';
import Header from '@/components/Header';
import ClientForm from '@/pages/ClientForm';
import supabase from '@/lib/supabaseClient';
import { useAppContext } from '@/context/AppContext';

function App() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { setClients, setBookings, setServices, clients, bookings, services } = useAppContext();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchInitialData = async () => {
        try {
          const [
            { data: clientsData },
            { data: bookingsData },
            { data: servicesData }
          ] = await Promise.all([
            supabase.from('contractors').select('*'),
            supabase.from('bookings').select('*'),
            supabase.from('services').select('*')
          ]);

          setClients(clientsData || []);
          setBookings(bookingsData || []);
          setServices(servicesData || []);
        } catch (error) {
          console.error('Error fetching initial data:', error);
        } finally {
          setIsDataLoading(false);
        }
      };

      fetchInitialData();
    } else {
      setIsDataLoading(false);
    }
  }, [isAuthenticated, location.pathname]);


    // log in console
    useEffect(() => {
      console.log('Clients:', clients);
      console.log('Bookings:', bookings);
      console.log('Services:', services);
    }
    , [clients, bookings, services]);
  
  if (isAuthLoading || isDataLoading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="bg-gray-50">
      {isAuthenticated && (
        <>
          <Sidebar />
          <Header />
        </>
      )}
      <div className="flex-1 p-4">
        <Routes location={location}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          {/* <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ClientContentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/new"
            element={
              <ProtectedRoute>
                <ClientForm mode="add" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id/edit"
            element={
              <ProtectedRoute>
                <ClientForm mode="edit" />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}