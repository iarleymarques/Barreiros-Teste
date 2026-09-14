import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalColaborador from './components/PortalColaborador';
import Historia from './components/Historia';
import FuncionamentoSite from './components/FuncionamentoSite';
import Footer from './components/Footer';
import PoliticaPrivacidade from './components/PoliticaPrivacidade';

import { getAuthToken, getCurrentUserApi, removeAuthToken } from './services/api';

function Home({ isLoggedIn, user, onLogin, onLogout }) {
  return (
    <div className="min-h-screen text-slate-800 flex flex-col antialiased selection:bg-red-600 selection:text-white bg-[#F8FAFC]">
      {/* Navbar institucional com fundo limpo */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      {/* Área principal corporativa */}
      <main className="flex-grow relative">
        {/* Seções da Landing Page Pública */}
        <Historia />
        <FuncionamentoSite />
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
      console.warn('Erro ao limpar dados de sessão:', err);
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

