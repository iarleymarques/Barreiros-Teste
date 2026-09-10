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
    <div className="min-h-screen text-zinc-800 flex flex-col antialiased selection:bg-red-600 selection:text-white bg-zinc-900">
      {/* Navbar com fundo limpo no topo */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      {/* Área principal com imagem da Distribuidora Irmãos Barreiro */}
      <main className="flex-grow relative overflow-hidden">
        {/* IMAGEM DE FUNDO GLOBAL (Distribuidora Irmãos Barreiro) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'url(/images/fundo_distribuidora_barreiro.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            filter: 'brightness(0.75) contrast(1.12) saturate(1.05)',
          }}
        />

        {/* Overlay translúcido fixo para estabilidade e nitidez */}
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-900/15 to-zinc-950/40 pointer-events-none z-0"
        />

        {/* Seções da Landing Page Pública */}
        <div className="relative z-10">
          <Historia />
          <FuncionamentoSite />
        </div>
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

