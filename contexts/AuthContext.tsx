import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';

interface User {
  email: string;
  name: string;
}

interface StoredUser extends User {
  password: string; // In a real production app, this should be hashed. For local extension storage, we store simply.
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for active session
    const activeSession = localStorage.getItem('pp_active_session');
    if (activeSession) {
      setUser(JSON.parse(activeSession));
    }
    setLoading(false);
  }, []);

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem('pp_users_db');
    return users ? JSON.parse(users) : [];
  };

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const users = getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (foundUser) {
      const sessionUser = { email: foundUser.email, name: foundUser.name };
      setUser(sessionUser);
      localStorage.setItem('pp_active_session', JSON.stringify(sessionUser));
    } else {
      throw new Error("Invalid email or password.");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User with this email already exists.");
    }

    const newUser: StoredUser = { email, password, name };
    const updatedUsers = [...users, newUser];
    
    localStorage.setItem('pp_users_db', JSON.stringify(updatedUsers));
    
    // Auto login after register
    const sessionUser = { email, name };
    setUser(sessionUser);
    localStorage.setItem('pp_active_session', JSON.stringify(sessionUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pp_active_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}