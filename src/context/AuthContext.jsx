import { createContext, useContext, useState, useEffect } from 'react';
import { BASE, getToken, setToken, clearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // On mount: agar token hai to Bearer se session validate karo
  useEffect(() => {
    const t = getToken();
    if (!t) { setLoading(false); return; }
    fetch(`${BASE}/auth/me`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else { clearToken(); setTok(null); }   // invalid/expired token
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // verify-otp response se user + token dono milte hain
  const login = (newUser, newToken) => {
    if (newToken) { setToken(newToken); setTok(newToken); }
    setUser(newUser);
  };

  const logout = () => {
    const t = getToken();
    fetch(`${BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    }).catch(() => {});
    clearToken();
    setTok(null);
    setUser(null);
  };

  const updateUser = (fields) => {
    setUser((prev) => prev ? { ...prev, ...fields } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
