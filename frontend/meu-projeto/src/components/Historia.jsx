import React from 'react';
import { MapPin, LogIn, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Historia({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  return (
    <section id="historia">

      {/* ================================================================== */}
      {/* 1. HERO INSTITUCIONAL                                               */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-16">
        <div className="max-w-3xl">

          {/* Linha de acento */}
          <div className="w-10 h-0.5 bg-red-700 mb-8"></div>

          {/* Headline principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D0D0D] tracking-tight leading-[1.08] mb-5">
            Distribuidora<br />
            Irmãos Barreiro
          </h1>

          {/* Subtítulo direto */}
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mb-8">
            Atacado de bebidas em Cascavel, Ceará — desde 1997.
            Abastecimento contínuo de cerveja, chope e refrigerante
            para o comércio regional.
          </p>

          {/* CTA único */}
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/portal')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D0D0D] hover:bg-slate-800 text-white text-sm font-bold tracking-wide transition-colors duration-150 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              Área do Colaborador
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-800 text-white text-sm font-bold tracking-wide transition-colors duration-150 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. FAIXA DE NÚMEROS-CHAVE (sem ícones, sem cards)                  */}
      {/* ================================================================== */}
      <div className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200">

            <div className="py-7 px-6 sm:px-8">
              <div className="text-2xl sm:text-3xl font-black text-[#0D0D0D] tabular-nums">1997</div>
              <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Fundação</div>
            </div>

            <div className="py-7 px-6 sm:px-8">
              <div className="text-2xl sm:text-3xl font-black text-[#0D0D0D]">~30 anos</div>
              <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">No mercado</div>
            </div>

            <div className="py-7 px-6 sm:px-8">
              <div className="text-2xl sm:text-3xl font-black text-[#0D0D0D]">Atacado</div>
              <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Segmento</div>
            </div>

            <div className="py-7 px-6 sm:px-8">
              <div className="text-2xl sm:text-3xl font-black text-[#0D0D0D]">Cascavel</div>
              <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">Ceará · Sede</div>
            </div>

          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. BLOCO INSTITUCIONAL ÚNICO                                        */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Texto institucional */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0D0D0D] tracking-tight leading-snug mb-6">
              Um elo consolidado na cadeia de distribuição de bebidas do interior cearense
            </h2>

            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Com sede no <span className="text-slate-900 font-semibold">Distrito Industrial de Cascavel</span>,
              a Distribuidora Irmãos Barreiro recebe e distribui as linhas da Solar Coca-Cola e demais marcas
              parceiras, garantindo abastecimento constante a bares, restaurantes, mercados e pontos de venda
              da cidade e região.
            </p>

            <p className="text-slate-600 text-base leading-relaxed mb-10">
              Em quase três décadas de operação contínua, a empresa firmou sua reputação sobre pontualidade
              nas entregas, integralidade dos produtos e relacionamento direto com o comércio local.
            </p>

            {/* Endereço */}
            <div className="flex items-start gap-2.5 text-sm text-slate-500">
              <MapPin className="w-4 h-4 text-red-700 mt-0.5 shrink-0" />
              <span>
                Rua João Damasceno Fontenele, nº 5003<br />
                Distrito Industrial — Cascavel, CE
              </span>
            </div>
          </div>

          {/* Imagem corporativa */}
          <div className="relative overflow-hidden bg-slate-100">
            <img
              src="/images/copo_refrigerante.jpg"
              alt="Distribuição de Bebidas — Distribuidora Irmãos Barreiro, Cascavel CE"
              className="w-full h-80 sm:h-96 lg:h-[440px] object-cover object-center"
            />
            {/* Etiqueta discreta */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#0D0D0D]/80 backdrop-blur-sm px-5 py-3">
              <p className="text-white text-xs font-medium tracking-wide">
                Distribuidora Irmãos Barreiro · Cascavel — CE
              </p>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
