import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { loginApi } from '../services/api';
import { LogIn, LogOut, X, Lock, Mail, AlertCircle, Loader2, LayoutDashboard } from 'lucide-react';

export default function Navbar({ isLoggedIn, user, onLogin, onLogout }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  function handleClose() {
    setIsLoginOpen(false);
    setErrorMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Valida credenciais diretamente contra o banco de dados PostgreSQL (Barreiro)
      const data = await loginApi(email.trim(), password);
      
      if (onLogin) {
        onLogin(data.user || { email: email.trim() });
      }
      handleClose();
      navigate('/portal');
    } catch (err) {
      console.error("Erro na autenticação:", err);
      setErrorMsg(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha no banco de dados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-zinc-200/80 shadow-xs py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Right: Login ou Status Conectado */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/portal')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Área do Colaborador</span>
                </button>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-700 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-200 shadow-xs transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 hover:shadow-red-600/35 transition-all duration-200 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Modal de Acesso - Entrar no Sistema */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-100 relative">
            
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2 border border-red-100">
                <Lock className="w-3.5 h-3.5 text-red-600" />
                <span>Área Restrita</span>
              </div>
              <h3 className="text-2xl font-black text-zinc-900">
                Entrar no Sistema
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Informe suas credenciais para acessar o portal da Distribuidora Irmãos Barreiro.
              </p>
            </div>

            {/* Mensagem de Erro de Autenticação */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-600 mb-1.5">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colaborador@irmaosbarreiro.com.br"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-600 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-sm"
                  />
                </div>
              </div>

              <button
                id="btn-submit-modal"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 mt-2 bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
