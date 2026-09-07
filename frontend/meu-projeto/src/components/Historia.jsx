import React from 'react';
import {
  Building2,
  MapPin,
  Award,
  ShieldCheck,
  Users,
  Store,
  Truck,
  Clock,
  Calendar,
  Beer,
  Package
} from 'lucide-react';

export default function Historia() {
  return (
    <section id="historia" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* -------------------------------------------------------------- */}
        {/* BLOCO 1: DISTRIBUIDORA IRMÃOS BARREIRO EM CASCAVEL, CEARÁ      */}
        {/* -------------------------------------------------------------- */}
        <div>
          {/* Cabeçalho com contraste perfeito para o fundo intermediário */}
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-red-700 border border-white/30 text-xs font-bold uppercase tracking-wider mb-3 shadow-md backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>Nossa História & Presença Corporativa</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Distribuidora Irmãos Barreiro em Cascavel CE
            </h2>

            <div className="flex items-center gap-1.5 mt-3 sm:justify-start justify-center">
              <div className="w-16 h-1.5 bg-red-600 rounded-full"></div>
              <div className="w-3 h-1.5 bg-red-400 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
            </div>
          </div>

          {/* Card Principal — Distribuidora Irmãos Barreiro */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 lg:p-12 border border-white/80 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Brilho decorativo sutil */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {/* Parágrafo de abertura */}
            <div className="relative z-10">
              <p className="text-zinc-800 text-base sm:text-lg lg:text-xl leading-relaxed">
                A <strong className="font-bold text-zinc-950">Distribuidora Irmãos Barreiro de Bebidas</strong> é uma empresa cearense fundada em <strong className="font-semibold text-zinc-950">6 de março de 1997</strong>, com sede na <strong className="font-semibold text-zinc-950">Rua João Damasceno Fontenele, nº 5003</strong>, no <strong className="font-semibold text-zinc-950">Distrito Industrial de Cascavel, Ceará</strong>. Ao longo de mais de <strong className="font-bold text-red-600">quase 30 anos de atuação</strong>, a empresa se consolidou no comércio atacadista de cerveja, chope e refrigerante, atendendo comerciantes e consumidores em Cascavel e região.
              </p>
            </div>

            {/* Caixa interna com números de destaque */}
            <div className="relative z-10 bg-zinc-50/90 rounded-2xl p-6 sm:p-8 border-l-4 border-l-red-600 border border-zinc-200/90 shadow-sm space-y-6">
              <p className="text-zinc-700 text-base sm:text-lg leading-relaxed">
                Com mais de duas décadas e meia de história, tradição e forte compromisso com o desenvolvimento regional, a Distribuidora Irmãos Barreiro atua com excelência no fornecimento e abastecimento contínuo de bebidas, fortalecendo parcerias comerciais e impulsionando a economia local.
              </p>

              {/* Grid de métricas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-200">
                {/* 1. FUNDAÇÃO */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs hover:border-red-300 transition-colors">
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Fundação</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900">1997</div>
                  <span className="text-xs text-zinc-500 font-medium">Início das atividades em Cascavel/CE</span>
                </div>

                {/* 2. TRAJETÓRIA */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs hover:border-red-300 transition-colors">
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Trajetória</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900">Quase 30 anos</div>
                  <span className="text-xs text-zinc-500 font-medium">De atuação no mercado cearense</span>
                </div>

                {/* 3. SEGMENTO */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <Beer className="w-3.5 h-3.5" />
                    <span>Segmento</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-zinc-900">Atacado de Bebidas</div>
                  <span className="text-xs text-zinc-500 font-medium">Cerveja, chope e refrigerante</span>
                </div>

                {/* 4. SEDE */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Sede</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900">Cascavel - CE</div>
                  <span className="text-xs text-zinc-500 font-medium">Distrito Industrial</span>
                </div>
              </div>
            </div>

            {/* Parágrafo de fechamento */}
            <div className="relative z-10">
              <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
                Presente no dia a dia dos cascavelenses e comércios da região, a Distribuidora une tradição, agilidade e confiança, contribuindo ativamente para o abastecimento e fortalecimento do comércio local.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* BLOCO 2: DISTRIBUIDORA IRMÃOS BARREIRO                         */}
        {/* -------------------------------------------------------------- */}
        <div className="space-y-6">
          {/* Cabeçalho Distribuidora */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/20 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-red-700 text-xs font-bold uppercase tracking-wider mb-2 border border-white/30 shadow-md backdrop-blur-md">
                <Store className="w-3.5 h-3.5 text-red-600" />
                <span>Elo Regional de Distribuição</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                Distribuidora Irmãos Barreiro de Bebidas
              </h3>
              <p className="text-sm text-zinc-200 mt-1 drop-shadow-xs">
                Presença e abastecimento contínuo no comércio e varejo de Cascavel e região.
              </p>
            </div>
          </div>

          {/* Card da Distribuidora */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden border border-white/80 shadow-2xl grid grid-cols-1 lg:grid-cols-12">

            {/* Foto */}
            <div className="lg:col-span-5 relative min-h-[320px] overflow-hidden bg-zinc-900">
              <img
                src="/images/copo_refrigerante.jpg"
                alt="Distribuição de Bebidas - Distribuidora Irmãos Barreiro"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                style={{ minHeight: '320px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent"></div>

              <div className="absolute top-4 left-4">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  Cascavel - CE
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-white text-xs font-semibold bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-white/20 inline-flex items-center gap-1.5 backdrop-blur-sm">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  Operação & Atendimento Regional
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-gradient-to-br from-white via-zinc-50/90 to-red-50/30">

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-200/60">
                  <Store className="w-3.5 h-3.5 text-red-600" />
                  <span>Elo Regional em Cascavel - CE</span>
                </div>

                <h4 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                  Distribuidora Irmãos Barreiro
                </h4>

                <p className="text-zinc-700 text-base sm:text-lg leading-relaxed">
                  Com quase <strong>30 anos de atuação e tradição familiar em Cascavel</strong>, a empresa é um dos elos regionais essenciais da grande cadeia de distribuição de Bebidas <strong className="text-zinc-950 font-bold"></strong> no interior do Ceará.
                </p>
              </div>

              {/* Destaque operacional */}
              <div className="bg-white/90 rounded-2xl p-5 border-l-4 border-l-red-600 border border-zinc-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider">
                  <Truck className="w-4 h-4" />
                  <span>Atuação no Atacado Regional</span>
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Recebe as bebidas fabricadas pela Solar e abastece no atacado bares, mercadinhos, restaurantes e pontos de venda de Cascavel e cidades vizinhas, garantindo capilaridade, frescor e agilidade logística ao comércio local.
                </p>
              </div>

              {/* Pilares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0 border border-red-100">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                      Tradição Regional
                    </span>
                    <div className="text-base font-black text-zinc-900 mt-0.5">Quase 30 Anos</div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                      Solidez e atuação contínua no atacado de bebidas.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0 border border-red-100">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                      Varejo & PDVs
                    </span>
                    <div className="text-base font-black text-zinc-900 mt-0.5">Atendimento Direto</div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                      Abastecimento de bares, restaurantes e comércios.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
