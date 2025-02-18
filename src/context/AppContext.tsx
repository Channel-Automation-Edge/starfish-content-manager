import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the shape of the context
interface AppContextType {
  sample: string;
  setSample: (value: string) => void;
  form: {
    name: string;
    phone: string;
  };
  setForm: (value: { name: string; phone: string }) => void;

  clients: any;
  setClients: (value: any) => void;
  bookings: any;
  setBookings: (value: any) => void;
  selectedClient: any;
  setSelectedClient: (value: any) => void;
  selectedBooking: any;
  setSelectedBooking: (value: any) => void;
  services: any;
  setServices: (value: any) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sample, setSample] = useState<string>('');
  const [form, setForm] = useState<{ name: string; phone: string }>({
    name: '',
    phone: '',
  });
  const [clients, setClients] = useState<any>([]);
  const [bookings, setBookings] = useState<any>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [services, setServices] = useState<any>([]);

  return (
    <AppContext.Provider value={{ sample, setSample, form, setForm, clients, setClients, bookings, setBookings, selectedClient, setSelectedClient, selectedBooking, setSelectedBooking, services, setServices }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};