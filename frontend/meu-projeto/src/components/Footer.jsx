import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#101214]/95 backdrop-blur-md text-[#b7bac0] border-t border-[#2c3035] z-20 no-print">
      {/* Linha superior com gradiente sutil e refinado */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e3141a]/60 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          
          {/* Lado Esquerdo: Logo Integrado + Informações Legais */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="origin-center sm:origin-left">
              <Logo isDark={true} className="h-10 sm:h-12" />
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-[#2c3035]"></div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-[#f2f2ef]">
                <MapPin className="w-3.5 h-3.5 text-[#e3141a] shrink-0" />
                <span>Distribuidora Irmãos Barreiro • Cascavel - CE</span>
              </div>
              <p className="text-[11px] text-[#8d9096]">
                © {currentYear} Distribuidora Irmãos Barreiro. Todos os direitos reservados.
              </p>
            </div>
          </div>

          {/* Lado Direito: Link LGPD + Crédito Profissional */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
            <Link
              to="/politica-de-privacidade"
              className="text-xs text-[#8d9096] hover:text-[#e3141a] transition-colors duration-150 underline-offset-2 hover:underline"
            >
              Política de Privacidade
            </Link>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#191c1f] border border-[#2c3035] text-xs shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#e3141a] shrink-0" />
              <span className="text-[#8d9096]">
                Desenvolvido por{' '}
                <strong className="text-[#f2f2ef] font-semibold hover:text-[#e3141a] transition-colors">
                  Distribuidora Irmãos Barreiro
                </strong>
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
