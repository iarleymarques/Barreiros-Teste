import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">

          {/* Esquerda: informações institucionais */}
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-600">Distribuidora Irmãos Barreiro</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Cascavel, CE — Distrito Industrial</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>© {currentYear}</span>
          </div>

          {/* Direita: link de privacidade */}
          <Link
            to="/politica-de-privacidade"
            className="text-slate-400 hover:text-red-700 transition-colors duration-150 font-medium underline-offset-2 hover:underline"
          >
            Política de Privacidade
          </Link>

        </div>
      </div>
    </footer>
  );
}
