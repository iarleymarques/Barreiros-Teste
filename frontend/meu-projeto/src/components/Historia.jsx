import React from 'react';
import { LogIn, LayoutDashboard, UserPlus, FileText, Banknote, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: UserPlus,
    title: 'Cadastro de Diaristas',
    desc: 'Registro completo com dados pessoais, endereço e foto do colaborador temporário.',
  },
  {
    icon: Banknote,
    title: 'Dados Bancários & PIX',
    desc: 'Coleta segura de conta bancária ou chave PIX para processamento de pagamentos.',
  },
  {
    icon: FileText,
    title: 'Comprovante em PDF',
    desc: 'Geração automática do recibo cadastral com protocolo exclusivo e carimbo digital.',
  },
  {
    icon: ShieldCheck,
    title: 'Conformidade LGPD',
    desc: 'Aceite de termos de privacidade registrado antes de qualquer coleta de dados.',
  },
];

export default function Historia({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();

  return (
    <section id="historia" className="bg-white">

      {/* ================================================================= */}
      {/* HERO — Split layout: texto esquerdo, mock de documento direito     */}
      {/* ================================================================= */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[540px] items-stretch">

            {/* Coluna esquerda: conteúdo */}
            <div className="flex flex-col justify-center py-16 sm:py-20 lg:pr-16">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">
                Sistema Interno · Área de RH
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D0D0D] tracking-tight leading-[1.1] mb-4">
                Cadastro e gestão<br className="hidden sm:block" /> de diaristas
              </h1>

              <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md mb-8">
                Preenchimento guiado por etapas, registro de dados bancários e chave PIX,
                aceite LGPD e emissão automática de comprovante em PDF.
              </p>

              {/* CTA único */}
              {isLoggedIn ? (
                <div>
                  <button
                    onClick={() => navigate('/portal')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0D0D0D] hover:bg-slate-800 text-white text-sm font-bold tracking-wide transition-colors duration-150 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Acessar o Portal
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-800 text-white text-sm font-bold tracking-wide transition-colors duration-150 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar no Sistema
                  </button>
                  <p className="mt-3 text-xs text-slate-400">
                    Acesso restrito à equipe de RH autorizada.
                  </p>
                </div>
              )}
            </div>

            {/* Coluna direita: mock de formulário/documento */}
            <div className="hidden lg:flex items-center justify-center bg-slate-50 border-l border-slate-200 py-16 px-12">
              {/* Documento estilizado — ilustração tipográfica, sem imagens externas */}
              <div className="w-full max-w-sm bg-white border border-slate-200 shadow-sm">

                {/* Cabeçalho do documento */}
                <div className="bg-[#0D0D0D] px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal RH</div>
                    <div className="text-sm font-bold text-white mt-0.5">Comprovante Cadastral</div>
                  </div>
                  <div className="w-7 h-7 border border-red-600 flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-600"></div>
                  </div>
                </div>

                {/* Corpo: campos de formulário simulados */}
                <div className="px-5 py-5 space-y-4">

                  {[
                    { label: 'Nome completo', width: 'w-full' },
                    { label: 'CPF', width: 'w-2/3' },
                    { label: 'Data de nascimento', width: 'w-1/2' },
                  ].map((field, i) => (
                    <div key={i}>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {field.label}
                      </div>
                      <div className={`h-2 bg-slate-200 ${field.width}`}></div>
                    </div>
                  ))}

                  {/* Seção PIX */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Chave PIX
                    </div>
                    <div className="h-2 bg-slate-200 w-4/5"></div>
                  </div>

                  {/* Checkbox LGPD */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 border border-red-700 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 bg-red-700"></div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Aceite de Política de Privacidade
                    </div>
                  </div>

                  {/* Botão simulado */}
                  <div className="pt-2">
                    <div className="bg-red-700 text-center py-2.5">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                        Emitir Comprovante em PDF
                      </span>
                    </div>
                  </div>

                  {/* Protocolo */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[9px] text-slate-300 font-mono">Protocolo #IB-2026-XXXX</div>
                    <div className="text-[9px] text-slate-300 font-mono">Cascavel · CE</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* O QUE VOCÊ PODE FAZER AQUI — 4 blocos funcionais                  */}
      {/* ================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">

        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            O que você pode fazer aqui
          </h2>
          <div className="w-8 h-0.5 bg-red-700 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="px-6 py-7 hover:bg-slate-50 transition-colors duration-100">
                <Icon className="w-5 h-5 text-red-700 mb-4 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-[#0D0D0D] mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
