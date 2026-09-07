import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-zinc-950/95 backdrop-blur-md text-zinc-400 border-t border-zinc-800/80 z-20 no-print">
      {/* Linha superior com gradiente sutil e refinado */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          
          {/* Lado Esquerdo: Logo Integrado + Informações Legais + Link LGPD */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="origin-center sm:origin-left">
              <Logo isDark={true} className="h-10 sm:h-12" />
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-zinc-800"></div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-zinc-200">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Distribuidora Irmãos Barreiro • Cascavel - CE</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                © {currentYear} Distribuidora Irmãos Barreiro. Todos os direitos reservados.
              </p>
            </div>
          </div>

          {/* Lado Direito: Crédito Profissional do Desenvolvedor */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/90 text-xs shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-zinc-400">
              Desenvolvido por{' '}
              <strong className="text-zinc-100 font-semibold hover:text-red-400 transition-colors">
                Distribuidora Irmãos Barreiro
              </strong>
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
