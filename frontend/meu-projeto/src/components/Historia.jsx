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
  ExternalLink,
  CheckCircle2,
  FileCheck
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
        {/* Overlay escuro unificado para contraste e legibilidade corporativa */}
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px]"></div>

        {/* HERO PRINCIPAL */}
        <div className="relative z-10 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px] items-center py-12 lg:py-16 gap-8 lg:gap-12">

              {/* Coluna esquerda: conteúdo institucional baseado no que o site dispõe */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-700/50 text-red-300 text-[11px] font-bold uppercase tracking-wider mb-4 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>Portal Operacional & RH · Distribuidora Irmãos Barreiro</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12] mb-4">
                  Gestão de Diaristas, Recibos & Segurança Operacional
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mb-6">
                  Sistema corporativo integrado para cadastro de colaboradores, controle diário de pagamentos via PIX, 
                  emissão de recibos com quitação jurídica, relatórios analíticos Solar e Permissões de Trabalho (PTs).
                </p>

                {/* Micro-pills com os recursos reais disponíveis no sistema */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/10">
                    <FileText className="w-3.5 h-3.5 text-red-400" /> Ficha Cadastral em PDF
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/10">
                    <Users className="w-3.5 h-3.5 text-red-400" /> Controle de Diárias & PIX
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/10">
                    <Receipt className="w-3.5 h-3.5 text-red-400" /> Recibos com Quitação
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/10">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Relatórios Solar
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-medium border border-white/10">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400" /> Permissões de Trabalho (PTs)
                  </span>
                </div>

                {/* CTA principal */}
                {isLoggedIn ? (
                  <div>
                    <button
                      onClick={() => navigate('/portal')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-[#0D0D0D] text-sm font-bold tracking-wide transition-colors duration-150 cursor-pointer shadow-lg shadow-black/20"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Acessar o Portal do Colaborador
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={onOpenLogin}
                      className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-700 hover:bg-red-800 text-white text-sm font-bold tracking-wide transition-colors duration-150 cursor-pointer shadow-xl shadow-red-950/50"
                    >
                      <LogIn className="w-4 h-4" />
                      Entrar no Sistema
                    </button>
                    <p className="mt-3 text-xs text-slate-400">
                      Acesso restrito à equipe autorizada de RH, administração e operações.
                    </p>
                  </div>
                )}
              </div>

              {/* Coluna direita: DOCUMENTO REALISTA (Ficha / Comprovante Oficial) */}
              <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
                <div className="w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-lg overflow-hidden text-slate-800">

                  {/* Topo do documento com branding da empresa */}
                  <div className="bg-[#0b121e] px-5 py-4 relative border-b border-red-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-wider uppercase text-red-400">
                          <span>Distribuidora Irmãos Barreiro</span>
                          <span>•</span>
                          <span>RH Oficial</span>
                        </div>
                        <div className="text-sm font-black text-white mt-0.5 tracking-tight">
                          Ficha Cadastral do Colaborador
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Ativo</span>
                      </div>
                    </div>
                  </div>

                  {/* Corpo do Documento com Dados Reais */}
                  <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/60">

                    {/* Perfil com Avatar e Ocupação Real */}
                    <div className="flex items-center gap-3 p-2.5 rounded-md bg-white border border-slate-200/90 shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        FS
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate text-xs">
                          Francisco Silva de Oliveira
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Diarista Operacional · Expedição e Carga
                        </div>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-100">
                        Diarista
                      </span>
                    </div>

                    {/* Grid com CPF e Data de Nascimento / Local */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-md bg-white border border-slate-200/90">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                          CPF Validado
                        </span>
                        <span className="font-bold text-slate-800 font-mono">
                          048.***.923-14
                        </span>
                      </div>
                      <div className="p-2 rounded-md bg-white border border-slate-200/90">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                          Nascimento / Cidade
                        </span>
                        <span className="font-semibold text-slate-800">
                          12/06/1993 · Cascavel
                        </span>
                      </div>
                    </div>

                    {/* Chave PIX Formatada e Verificada */}
                    <div className="p-2.5 rounded-md bg-white border border-slate-200/90">
                      <div className="flex items-center justify-between text-[9px] uppercase font-bold text-slate-400 mb-1">
                        <span>Chave PIX Cadastrada</span>
                        <span className="text-emerald-700 font-bold lowercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verificada
                        </span>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-xs flex items-center justify-between">
                        <span>(85) 98842-1092</span>
                        <span className="text-[10px] text-slate-500 font-sans font-normal">Tipo: Celular</span>
                      </div>
                    </div>

                    {/* Termo e Aceite LGPD Registrado */}
                    <div className="flex items-start gap-2 p-2 rounded-md bg-emerald-50/70 border border-emerald-200 text-[10px] text-emerald-950">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <span className="font-bold">Termo de Privacidade LGPD Aceito:</span> Consentimento digital registrado para processamento operacional.
                      </div>
                    </div>

                    {/* Botão de Geração com Ícone Oficial */}
                    <div className="pt-0.5">
                      <div className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-[11px] py-2.5 px-3 rounded shadow-xs flex items-center justify-center gap-2 transition-colors">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Ficha Cadastral Oficial em PDF</span>
                      </div>
                    </div>

                    {/* Metadados: Protocolo, Hash e Município */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <div>
                        <span className="font-bold text-slate-700">PROTOCOLO:</span> #IB-2026-0842
                      </div>
                      <div className="text-slate-500">
                        Cascavel · CE
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* O QUE VOCÊ PODE FAZER AQUI — 6 MÓDULOS REAIS DO SISTEMA           */}
        {/* ================================================================= */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">

          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">
                Recursos do Sistema
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                O que você pode fazer aqui
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
                  className="group bg-slate-950/70 hover:bg-slate-900/90 p-6 sm:p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between"
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
