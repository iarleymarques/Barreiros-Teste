import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalColaborador from './components/PortalColaborador';
import Historia from './components/Historia';
import Footer from './components/Footer';
import PoliticaPrivacidade from './components/PoliticaPrivacidade';

import { getAuthToken, getCurrentUserApi, removeAuthToken } from './services/api';

function Home({ isLoggedIn, user, onLogin, onLogout }) {
  // Estado do modal de login elevado para cá, para que o Hero da home
  // também possa acionar o modal com o mesmo CTA "Entrar".
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 flex flex-col antialiased selection:bg-red-700 selection:text-white bg-white">
      {/* Navbar institucional */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
      />

      {/* Área principal corporativa */}
      <main className="flex-grow">
        <Historia
          isLoggedIn={isLoggedIn}
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      </main>

      {/* Rodapé */}
      <Footer />
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    async function restoreValidatedSession() {
      if (!getAuthToken()) return;

      try {
        const currentUser = await getCurrentUserApi();
        if (active) {
          setUser(currentUser);
          setIsLoggedIn(true);
        }
      } catch {
        // Do not allow an old token to unlock the portal without the API.
        removeAuthToken();
        try {
          sessionStorage.removeItem('user_barreiro');
        } catch {
          // Storage is unavailable; there is no session to keep.
        }
      }
    }

    restoreValidatedSession();
    return () => {
      active = false;
    };
  }, []);

  function handleLogin(userData) {
    setIsLoggedIn(true);
    setUser(userData);
    try {
      sessionStorage.setItem('user_barreiro', JSON.stringify(userData));
    } catch (err) {
      console.warn('Erro ao salvar dados de sessão:', err);
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUser(null);
    removeAuthToken();
    try {
      sessionStorage.removeItem('user_barreiro');
    } catch (err) {
      console.warn('Erro ao limpar dados de sessão:', err);;
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              isLoggedIn={isLoggedIn}
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
          }
        />
        {/* Rota Protegida do Portal do Colaborador */}
        <Route
          path="/portal"
          element={
            isLoggedIn ? (
              <PortalColaborador
                user={user}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
        {/* Rota coringa */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
