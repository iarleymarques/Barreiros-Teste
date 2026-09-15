import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const modules = [
  {
    num: '01',
    title: 'Cadastro do colaborador',
    desc: 'Admissão com dados pessoais, endereço, documentos e chave PIX, gerando a ficha oficial em PDF.',
    action: 'Emitir ficha cadastral',
  },
  {
    num: '02',
    title: 'Lançamento da diária',
    desc: 'Conferência diária de presença e pagamento, com cálculo automático por diária trabalhada.',
    action: 'Gerenciar diárias',
  },
  {
    num: '03',
    title: 'Emissão do recibo',
    desc: 'Recibo com validade jurídica gerado automaticamente após a confirmação do pagamento.',
    action: 'Emitir recibos',
  },
  {
    num: '04',
    title: 'Relatório consolidado',
    desc: 'Fechamento Solar mensal com histórico acumulado de diárias e valores da operação.',
    action: 'Gerar relatórios',
  },
  {
    num: '05',
    title: 'Registro de funcionários',
    desc: 'Histórico contínuo, data de entrada, diárias prestadas e valor total acumulado.',
    action: 'Consultar histórico',
  },
  {
    num: '06',
    title: 'Permissões de trabalho (PTs)',
    desc: 'Emissão e gestão de PTs obrigatórias de segurança antes do início de operações de risco em campo.',
    action: 'Emitir PTs de segurança',
  },
];

export default function Historia({ isLoggedIn, onOpenLogin }) {
  const navigate = useNavigate();
  const goToPortal = () => isLoggedIn ? navigate('/portal') : onOpenLogin();

  return (
    <section className="relative overflow-hidden bg-[#101214] text-[#f2f2ef]" style={{ backgroundImage: "linear-gradient(rgba(9,12,17,.91), rgba(9,12,17,.95)), url('/images/fundo_distribuidora_barreiro.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="pt-12 sm:pt-16">
          <div className="inline-flex items-center gap-2 border border-[#2c3035] bg-[#191c1f]/80 px-3 py-1 text-[11px] font-mono tracking-widest text-[#8d9096] uppercase mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e3141a]" />
            Plataforma Interna de Gestão & Operação
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            SISTEMA DE GESTÃO <span className="text-white/30 font-light">|</span> <span className="whitespace-nowrap text-white font-extrabold">IRMÃOS BARREIRO</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-[#b7bac0]">
            Uma plataforma integrada para organizar e acompanhar as rotinas administrativas e operacionais da Distribuidora Irmãos Barreiro. O sistema reúne, em um só ambiente, o cadastro de colaboradores, controle de diaristas e pagamentos, emissão de recibos, relatórios e permissões de trabalho — oferecendo mais segurança, agilidade e clareza para a equipe.
          </p>
        </div>

        <div id="modulos" className="scroll-mt-8 py-12">
          <div className="mb-7 flex flex-col justify-between gap-2 border-b border-[#2c3035] pb-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">COMO FUNCIONA</h2>
              <p className="mt-1 text-xs text-[#8d9096]">Do cadastro do colaborador ao fechamento financeiro, o sistema acompanha cada etapa da operação.</p>
            </div>
            <span className="font-mono text-[10px] font-semibold text-[#8d9096] uppercase tracking-wider">FLUXO OPERACIONAL</span>
          </div>

          {/* Grid com exatamente 6 caixinhas uniformes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map(item => (
              <button
                key={item.num}
                onClick={goToPortal}
                className="group flex min-h-[220px] flex-col justify-between border border-[#2c3035] bg-[#191c1f]/95 p-6 text-left transition hover:border-[#e3141a] hover:bg-[#1f2226]"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-[#e3141a]">{item.num}</span>
                  <h3 className="mt-3 text-lg font-bold text-white group-hover:text-white transition-colors">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#8d9096]">{item.desc}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#f2f2ef] group-hover:text-white">
                  <i className="h-px w-4 bg-[#e3141a] shrink-0" />
                  {item.action}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>

          {/* Seção Como protegemos os dados */}
          <div className="mt-12 border-l-2 border-[#e3141a] bg-[#191c1f]/95 p-6 sm:p-8">
            <div className="flex flex-col gap-5 pb-6 border-b border-[#2c3035] sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#e3141a]">
                  SEGURANÇA DA INFORMAÇÃO
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  COMO PROTEGEMOS OS DADOS
                </h3>
                <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#b7bac0]">
                  Os dados cadastrais, chaves PIX e documentos dos colaboradores temporários são processados em estrita observância à Lei Geral de Proteção de Dados.
                </p>
              </div>
              <Link
                to="/politica-de-privacidade"
                className="inline-flex items-center justify-center shrink-0 border border-[#2c3035] bg-[#101214] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-[#e3141a] hover:bg-[#1f2226]"
              >
                Ver política de privacidade
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#e3141a]">01</span>
                <h4 className="mt-1.5 text-sm font-bold text-white">Chaves PIX protegidas</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#8d9096]">
                  Informações financeiras armazenadas com acesso restrito à equipe autorizada.
                </p>
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-[#e3141a]">02</span>
                <h4 className="mt-1.5 text-sm font-bold text-white">Documentos com acesso restrito</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#8d9096]">
                  Fichas cadastrais e comprovantes disponíveis apenas para RH e administração.
                </p>
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-[#e3141a]">03</span>
                <h4 className="mt-1.5 text-sm font-bold text-white">Conformidade legal</h4>
                <p className="mt-1 text-xs leading-relaxed text-[#8d9096]">
                  Processos alinhados à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
