import React from 'react';
import { 
  LogIn, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Receipt, 
  Sun, 
  Briefcase, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight,
  ArrowDown,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const modules = [
  {
    icon: FileText,
    badge: 'Módulo 1',
    title: 'Relatório Individual',
    subtitle: 'Ficha Cadastral em PDF',
    desc: 'Formulário completo de admissão do colaborador com dados pessoais, endereço, documentos, chave PIX e emissão da ficha oficial em PDF.',
    actionText: 'Emitir ficha cadastral',
  },
  {
    icon: Users,
    badge: 'Módulo 2',
    title: 'Relação de Diaristas',
    subtitle: 'Controle Diário & PIX',
    desc: 'Lançamento e conferência diária de colaboradores, controle de chaves PIX, cálculo automático por diária e acompanhamento de pagamentos.',
    actionText: 'Gerenciar diárias',
  },
  {
    icon: Receipt,
    badge: 'Módulo 3',
    title: 'Emissão de Recibos',
    subtitle: 'Quitação Legal Formal',
    desc: 'Geração rápida de recibos de pagamento (diário, semanal ou mensal) para prestadores de serviço com validação e quitação jurídica.',
    actionText: 'Emitir recibos',
  },
  {
    icon: Sun,
    badge: 'Módulo 4',
    title: 'Relatórios Solar',
    subtitle: 'Consolidado Operacional',
    desc: 'Emissão de relatórios analíticos em PDF por dia e mês, consolidando quantidade de diárias e fechamento financeiro da operação.',
    actionText: 'Gerar relatórios',
  },
  {
    icon: Briefcase,
    badge: 'Módulo 5',
    title: 'Registro de Funcionários',
    subtitle: 'Histórico & Acumulado',
    desc: 'Acompanhamento do histórico contínuo de colaboradores, controle de data de entrada, diárias prestadas e valor financeiro total acumulado.',
    actionText: 'Consultar histórico',
  },
  {
    icon: ShieldAlert,
    badge: 'Módulo 6',
    title: 'Permissões de Trabalho (PTs)',
    subtitle: 'Segurança Operacional',
    desc: 'Emissão e gestão de PTs obrigatórias: Trabalho em Altura, Espaço Confinado, Eletricidade, Trabalho a Quente e Produtos Químicos.',
    actionText: 'Emitir PTs de segurança',
  },
];

const pillars = [
  {
    icon: Users,
    title: 'Diaristas & PIX',
    desc: 'Cadastro guiado e controle diário de pagamentos.',
  },
  {
    icon: Receipt,
    title: 'Recibos com Quitação',
    desc: 'Comprovação formal com plena validade jurídica.',
  },
  {
    icon: Sun,
    title: 'Operação Solar',
    desc: 'Fechamento diário e mensal de diárias em PDF.',
  },
  {
    icon: ShieldAlert,
    title: 'Segurança & PTs',
    desc: 'Permissões para Altura, Elétrica e Espaço Confinado.',
  },
];

export default function Historia({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  function handleModuleClick() {
    if (isLoggedIn) {
      navigate('/portal');
    } else {
      onOpenLogin();
    }
  }

  return (
    <section id="historia">

      {/* ================================================================= */}
      {/* FUNDO COM FOTO — cobre o hero e toda a seção de recursos          */}
      {/* ================================================================= */}
      <div
        className="relative"
        style={{
          backgroundImage: 'url(/images/fundo_distribuidora_barreiro.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay escuro balanceado com gradiente radial sutil para máxima legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/95 backdrop-blur-[1px]"></div>

        {/* ================================================================= */}
        {/* HERO PRINCIPAL — Proporções Áureas, Equilibrado e Elegante        */}
        {/* ================================================================= */}
        <div className="relative z-10 border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-14 text-center flex flex-col items-center">

            {/* Badge Institucional Discreta */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-700/60 text-red-300 text-[11px] font-bold uppercase tracking-wider mb-4 backdrop-blur-sm shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>Distribuidora Irmãos Barreiro · Sistema Corporativo</span>
            </div>

            {/* Título Principal de Alto Impacto (em 2 linhas perfeitamente balanceadas) */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-4 max-w-3xl mx-auto">
              Gestão de Diaristas, Recibos &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Segurança Operacional</span>
            </h1>

            {/* Texto Descritivo Direto e Escaneável */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto mb-6 font-normal">
              Controle de diárias e transferências PIX, emissão de recibos com quitação jurídica, 
              relatórios consolidados Solar e Permissões de Trabalho (PTs).
            </p>

            {/* Ações / CTAs com Estilo Corporativo Harmonioso */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5 w-full sm:w-auto">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/portal')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-lg shadow-red-950/50 hover:shadow-red-800/80"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Acessar o Portal do Colaborador</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-bold tracking-wide transition-all duration-150 cursor-pointer shadow-lg shadow-red-950/50 hover:shadow-red-800/80"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Sistema</span>
                </button>
              )}

              <a
                href="#modulos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 backdrop-blur-sm transition-all duration-150 cursor-pointer"
              >
                <span>Conhecer Módulos</span>
                <ArrowDown className="w-3.5 h-3.5 text-red-400" />
              </a>
            </div>

            {/* Aviso de Acesso Seguro */}
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 mb-8">
              <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Ambiente restrito e autenticado para a equipe de RH, administração e operações.</span>
            </div>

            {/* Barra dos 4 Pilares Operacionais com Design Premium Glassmorphism */}
            <div className="w-full border border-white/15 bg-slate-950/70 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-left">
              {pillars.map((p, i) => {
                const PillarIcon = p.icon;
                return (
                  <div key={i} className="p-4 sm:p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 shrink-0 group-hover:bg-red-700 group-hover:text-white transition-colors">
                        <PillarIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white text-xs sm:text-sm group-hover:text-red-300 transition-colors">
                        {p.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed pl-9.5">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* O QUE VOCÊ PODE FAZER AQUI? — 6 MÓDULOS REAIS DO SISTEMA          */}
        {/* ================================================================= */}
        <div id="modulos" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 scroll-mt-6">

          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                Recursos do Sistema
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                O QUE VOCÊ PODE FAZER AQUI?
              </h2>
              <div className="w-10 h-0.5 bg-red-600 mt-2"></div>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Conheça os módulos integrados disponíveis para a equipe operacional e administrativa da Distribuidora Irmãos Barreiro.
            </p>
          </div>

          {/* GRID DE 6 MÓDULOS DISPONÍVEIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden shadow-2xl rounded-sm">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  onClick={handleModuleClick}
                  className="group bg-slate-950/75 hover:bg-slate-900/95 p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 group-hover:text-white group-hover:bg-red-700 transition-colors">
                        <Icon className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-red-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                      {m.subtitle}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-red-400 group-hover:text-red-300">
                    <span>{m.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================================================================= */}
          {/* FAIXA DE CONFORMIDADE LGPD & SEGURANÇA JURÍDICA                    */}
          {/* ================================================================= */}
          <div className="mt-4 p-5 sm:p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xs rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-700/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  Segurança da Informação & Conformidade LGPD
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Os dados cadastrais, chaves PIX e documentos dos colaboradores temporários são processados em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>
            </div>

            <Link
              to="/politica-de-privacidade"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors duration-150 shrink-0 rounded-sm"
            >
              <span>Ver Política de Privacidade</span>
              <ExternalLink className="w-3 h-3 text-red-400" />
            </Link>
          </div>

        </div>

      </div>

    </section>
  );
}
