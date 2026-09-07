import React from 'react';
import { Link } from 'react-router-dom';
import { Workflow, ShieldCheck } from 'lucide-react';

export default function FuncionamentoSite() {
  const cards = [
    {
      num: '01',
      title: 'Acesso e Autenticação Segura',
      text: 'O RH com o consetimento do colaborador, realiza o acesso ou login com o email e senha, protegidos por criptografia. Nenhuma credencial ou dado é armazenado sem consentimento explícito.'
    },
    {
      num: '02',
      title: 'Preenchimento Guiado (Passo a Passo)',
      text: 'Formulário dividido em etapas claras, com indicação da finalidade de cada dado: informações pessoais, endereço com busca automática de CEP, dados bancários/PIX e dados profissionais da unidade.'
    },
    {
      num: '03',
      title: 'Aceite de Privacidade & Validação',
      text: 'Antes de avançar, você visualiza e aceita os Termos de Privacidade e Consentimento, sabendo exatamente como seus dados serão usados.',
      link: true
    },
    {
      num: '04',
      title: 'Emissão do Recibo Oficial em PDF',
      text: 'Geração automática do Comprovante Cadastral em PDF, protegido e transmitido com segurança, com layout corporativo da Distribuidora irmãos Barreiro, protocolo exclusivo e carimbo digital para validação junto ao RH.'
    }
  ];

  return (
    <section id="funcionamento" className="py-16 sm:py-24 relative border-t border-white/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Título da Seção */}
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-red-700 text-xs font-bold uppercase tracking-wider mb-3 border border-white/30 shadow-md backdrop-blur-md">
            <Workflow className="w-3.5 h-3.5 text-red-600" />
            <span>Guia & Sistema Operacional</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Funcionamento do Site
          </h2>

          {/* Marcador Visual */}
          <div className="flex items-center gap-1.5 mt-3 sm:justify-start justify-center">
            <div className="w-16 h-1.5 bg-red-600 rounded-full"></div>
            <div className="w-3 h-1.5 bg-red-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
          </div>
        </div>

        {/* Grid de Cards de Funcionamento com efeito translúcido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/80 shadow-xl hover:shadow-2xl hover:border-red-300 hover:bg-white transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 shadow-2xs">
                  Etapa {card.num}
                </span>
                <span className="text-2xl font-black text-zinc-300 group-hover:text-red-600 font-['Space_Grotesk'] transition-colors">
                  {card.num}
                </span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-red-600 transition-colors">
                {card.title}
              </h3>

              <p className="text-sm text-zinc-700 leading-relaxed">
                {card.text}
              </p>

              {card.link && (
                <Link
                  to="/politica-de-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Ler a Política de Privacidade completa</span>
                </Link>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
