import React from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Beer,
  Truck,
  ShieldCheck,
  Store
} from 'lucide-react';

export default function Historia() {
  const kpis = [
    {
      icon: Calendar,
      label: 'Ano de Fundação',
      value: '1997',
      description: 'Fundada em 6 de março em Cascavel/CE'
    },
    {
      icon: Clock,
      label: 'Tradição no Mercado',
      value: 'Quase 30 anos',
      description: 'Solidez contínua no setor de bebidas'
    },
    {
      icon: Beer,
      label: 'Segmento de Atuação',
      value: 'Atacado de Bebidas',
      description: 'Cerveja, chope, refrigerantes e linhas líderes'
    },
    {
      icon: MapPin,
      label: 'Sede Operacional',
      value: 'Cascavel - CE',
      description: 'Distrito Industrial • Atendimento regional'
    }
  ];

  return (
    <section id="historia" className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-14">

        {/* -------------------------------------------------------------- */}
        {/* HERO / CABEÇALHO PRINCIPAL EXECUTIVO                            */}
        {/* -------------------------------------------------------------- */}
        <div className="text-center sm:text-left max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Perfil Corporativo • Distribuidora Irmãos Barreiro</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Distribuidora Irmãos Barreiro em Cascavel CE
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Referência regional em abastecimento e comércio atacadista de bebidas, conectando as principais marcas aos comerciantes e varejistas com pontualidade, tradição e confiabilidade.
          </p>

          <div className="flex items-center gap-1.5 mt-5 sm:justify-start justify-center">
            <div className="w-14 h-1 bg-red-600 rounded-full"></div>
            <div className="w-3 h-1 bg-slate-300 rounded-full"></div>
            <div className="w-1.5 h-1 bg-slate-200 rounded-full"></div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* GRID DE KPIs / CARDS DE MÉTRICAS (4 COLUNAS NO TOPO)           */}
        {/* -------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpis.map((kpi, idx) => {
            const IconComponent = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 border-t-4 border-t-red-600 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {kpi.label}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mb-2">
                    {kpi.value}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-100 pt-3 mt-2">
                  {kpi.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* RESUMO EXECUTIVO FUNCIONAL & OPERAÇÃO REGIONAL                 */}
        {/* -------------------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 lg:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Coluna de Síntese Institucional */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                <span>Atuação Institucional & Logística</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight leading-snug">
                Solidez operacional e compromisso com o desenvolvimento regional
              </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Com sede estratégica no <strong className="text-slate-900 font-semibold">Distrito Industrial de Cascavel, Ceará</strong>, a <strong className="text-slate-900 font-semibold">Distribuidora Irmãos Barreiro</strong> atua há quase três décadas como elo essencial na cadeia de suprimentos de bebidas, abastecendo bares, restaurantes, mercadinhos e comércios locais com agilidade e constância.
              </p>

              {/* Destaques operacionais em 2 pilares sintéticos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                    <Truck className="w-4 h-4 text-red-600" />
                    <span>Capilaridade no Atacado</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Logística estruturada para atendimento ágil e contínuo aos pontos de venda de toda a região.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>Tradição & Confiança</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Parcerias comerciais consolidadas, integridade de produtos e atendimento personalizado ao comércio.
                  </p>
                </div>
              </div>

              {/* Endereço Institucional */}
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Rua João Damasceno Fontenele, nº 5003 • Distrito Industrial, Cascavel - CE</span>
              </div>
            </div>

            {/* Coluna da Foto Operacional Integrada */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs group">
                <img
                  src="/images/copo_refrigerante.jpg"
                  alt="Distribuição de Bebidas - Distribuidora Irmãos Barreiro"
                  className="w-full h-72 sm:h-80 lg:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3">
                  <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                    Cascavel - CE
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Operação & Atendimento
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Abastecimento Comercial Regional
                    </span>
                  </div>
                  <Store className="w-4 h-4 text-red-600 shrink-0" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
