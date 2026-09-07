import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Copy, 
  Check, 
  FileText, 
  Printer, 
  DollarSign, 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarDays,
  Plus,
  Minus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BarChart2,
  Table,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';
import RelatorioMensalModal from './RelatorioMensalModal';

export const DIARISTAS_INICIAIS = [];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseDataLocal(dataStr) {
  if (!dataStr) return new Date();
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
  }
  return new Date(dataStr);
}

function getHojeStr() {
  const agora = new Date();
  const y = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, '0');
  const d = String(agora.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatarDataBR(dataStr) {
  if (!dataStr) return '—';
  try {
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
  } catch {
    return dataStr;
  }
}

function formatarDataExtenso(dataStr) {
  if (!dataStr) return '';
  try {
    const data = parseDataLocal(dataStr);
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const diaSem = diasSemana[data.getDay()];
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = MESES[data.getMonth()];
    const ano = data.getFullYear();
    return `${diaSem}, ${dia} de ${mes} de ${ano}`;
  } catch {
    return formatarDataBR(dataStr);
  }
}

function somarDias(dataStr, dias) {
  const data = parseDataLocal(dataStr);
  data.setDate(data.getDate() + dias);
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatarMoeda(valor) {
  return valor.toFixed(2).replace('.', ',');
}

export default function RelacaoDiaristas({ 
  diaristas = [], 
  dataSelecionada: propDataSelecionada,
  setDataSelecionada: propSetDataSelecionada,
  onNavigateCadastrar, 
  onEmitirRecibo, 
  onUpdateDiarista, 
  onDeleteDiarista, 
  onResetDiaristas, 
  onBack 
}) {
  const hoje = getHojeStr();
  const hojeDate = new Date();

  const [busca, setBusca] = useState('');
  const [copiadoId, setCopiadoId] = useState(null);

  // =========================================================================
  // ESTADO DO ANO/MÊS/DIA VIGENTE
  // =========================================================================
  const getDataPadrao = () => {
    const datas = diaristas.map(d => d.data).filter(Boolean).sort().reverse();
    if (datas.includes(hoje)) return hoje;
    if (datas.length > 0) return datas[0];
    return hoje;
  };

  const [internalData, setInternalData] = useState(() => getDataPadrao());
  const activeData = propDataSelecionada || internalData;

  const setActiveData = (novaData) => {
    if (propSetDataSelecionada) propSetDataSelecionada(novaData);
    setInternalData(novaData);
  };

  // Ano vigente selecionado
  const dataRefParsed = parseDataLocal(activeData);
  const [anoVigente, setAnoVigente] = useState(dataRefParsed.getFullYear());

  // Mês selecionado no painel de meses (0-11)
  const [mesExpandidoIndex, setMesExpandidoIndex] = useState(dataRefParsed.getMonth());

  // Controles do mini-calendário original (mantido)
  const [mesAtual, setMesAtual] = useState(new Date(dataRefParsed.getFullYear(), dataRefParsed.getMonth(), 1));
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Painel da sub-tabela anual/mensal expandida
  const [mostrarSubTabelaMeses, setMostrarSubTabelaMeses] = useState(true);

  // Modal do Relatório Mensal Oficial
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [mesSelecionadoRelatorio, setMesSelecionadoRelatorio] = useState(dataRefParsed.getMonth());
  const [anoSelecionadoRelatorio, setAnoSelecionadoRelatorio] = useState(dataRefParsed.getFullYear());
  const [autoDownloadRelatorio, setAutoDownloadRelatorio] = useState(false);

  // =========================================================================
  // MAPAS DE CONTAGEM E TOTAIS POR DATA/MÊS
  // =========================================================================
  const contagemPorData = useMemo(() => {
    const mapa = {};
    diaristas.forEach((d) => {
      if (d.data) mapa[d.data] = (mapa[d.data] || 0) + 1;
    });
    return mapa;
  }, [diaristas]);

  const totalPorData = useMemo(() => {
    const mapa = {};
    diaristas.forEach((d) => {
      if (!d.data) return;
      const val = (parseFloat(d.valor) || 0) * (parseInt(d.diarias, 10) || 1);
      if (!mapa[d.data]) mapa[d.data] = { valor: 0, diarias: 0 };
      mapa[d.data].valor += val;
      mapa[d.data].diarias += parseInt(d.diarias, 10) || 1;
    });
    return mapa;
  }, [diaristas]);

  // Métricas por Mês: "YYYY-MM" -> { diaristas, diarias, valor }
  const metricasPorMes = useMemo(() => {
    const mapa = {};
    diaristas.forEach((d) => {
      if (!d.data) return;
      const mesKey = d.data.substring(0, 7); // YYYY-MM
      const val = (parseFloat(d.valor) || 0) * (parseInt(d.diarias, 10) || 1);
      if (!mapa[mesKey]) mapa[mesKey] = { diaristasSet: new Set(), diarias: 0, valor: 0, totalRegistros: 0 };
      mapa[mesKey].diaristasSet.add((d.nome || '').trim().toUpperCase());
      mapa[mesKey].diarias += parseInt(d.diarias, 10) || 1;
      mapa[mesKey].valor += val;
      mapa[mesKey].totalRegistros += 1;
    });
    // Converte Set para contagem
    const resultado = {};
    Object.keys(mapa).forEach(k => {
      resultado[k] = {
        diaristasUnicos: mapa[k].diaristasSet.size,
        diarias: mapa[k].diarias,
        valor: mapa[k].valor,
        totalRegistros: mapa[k].totalRegistros,
      };
    });
    return resultado;
  }, [diaristas]);

  // Datas disponíveis (com lançamentos)
  const datasDisponiveis = useMemo(() => {
    const set = new Set();
    diaristas.forEach(d => { if (d.data) set.add(d.data); });
    return Array.from(set).sort().reverse();
  }, [diaristas]);

  // Anos disponíveis (com registros + ano vigente)
  const anosDisponiveis = useMemo(() => {
    const anos = new Set([hojeDate.getFullYear(), anoVigente]);
    diaristas.forEach(d => {
      if (d.data) anos.add(parseInt(d.data.split('-')[0], 10));
    });
    return Array.from(anos).sort((a, b) => b - a);
  }, [diaristas, anoVigente]);

  // Dias do mês expandido que têm lançamentos
  const diasDoMesExpandido = useMemo(() => {
    const mesStr = String(mesExpandidoIndex + 1).padStart(2, '0');
    const prefixo = `${anoVigente}-${mesStr}`;
    const dias = [];
    const totalDias = new Date(anoVigente, mesExpandidoIndex + 1, 0).getDate();
    for (let d = 1; d <= totalDias; d++) {
      const diaStr = String(d).padStart(2, '0');
      const dataStr = `${prefixo}-${diaStr}`;
      dias.push({
        dia: d,
        dataStr,
        temLancamento: !!contagemPorData[dataStr],
        qtd: contagemPorData[dataStr] || 0,
        valor: totalPorData[dataStr]?.valor || 0,
        diarias: totalPorData[dataStr]?.diarias || 0,
        primeiroDiaSemana: new Date(anoVigente, mesExpandidoIndex, 1).getDay(),
      });
    }
    return dias;
  }, [anoVigente, mesExpandidoIndex, contagemPorData, totalPorData]);

  // Diaristas do dia ativo
  const diaristasDoDia = useMemo(() => {
    return diaristas.filter(item => item.data === activeData);
  }, [diaristas, activeData]);

  // Lista filtrada dentro do dia ativo
  const listaFiltrada = useMemo(() => {
    return diaristasDoDia.filter((item) => {
      const termo = busca.toLowerCase().trim();
      const matchBusca = !termo ||
        item.nome.toLowerCase().includes(termo) ||
        (item.pix && item.pix.toLowerCase().includes(termo));
      return matchBusca;
    });
  }, [diaristasDoDia, busca]);

  const totalDiariasQtd = listaFiltrada.reduce((acc, curr) => acc + (parseInt(curr.diarias, 10) || 1), 0);
  const totalValorGeral = listaFiltrada.reduce((acc, curr) => acc + ((parseFloat(curr.valor) || 0) * (parseInt(curr.diarias, 10) || 1)), 0);

  // =========================================================================
  // HANDLERS
  // =========================================================================
  function handleCopiarPix(pix, id) {
    if (!pix) return;
    navigator.clipboard.writeText(pix);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  function handlePrint() {
    window.print();
  }

  function handleMudarDiarias(item, delta) {
    if (!onUpdateDiarista) return;
    const atual = parseInt(item.diarias, 10) || 1;
    const novaQtd = Math.max(1, atual + delta);
    onUpdateDiarista({ ...item, diarias: novaQtd });
  }

  function diaAnterior() {
    const novaData = somarDias(activeData, -1);
    setActiveData(novaData);
    const d = parseDataLocal(novaData);
    setMesAtual(new Date(d.getFullYear(), d.getMonth(), 1));
    setMesExpandidoIndex(d.getMonth());
    setAnoVigente(d.getFullYear());
  }

  function diaSeguinte() {
    const novaData = somarDias(activeData, 1);
    setActiveData(novaData);
    const d = parseDataLocal(novaData);
    setMesAtual(new Date(d.getFullYear(), d.getMonth(), 1));
    setMesExpandidoIndex(d.getMonth());
    setAnoVigente(d.getFullYear());
  }

  function irParaHoje() {
    setActiveData(hoje);
    const d = parseDataLocal(hoje);
    setMesAtual(new Date(d.getFullYear(), d.getMonth(), 1));
    setMesExpandidoIndex(d.getMonth());
    setAnoVigente(d.getFullYear());
  }

  function anteriorMes() {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  }

  function proximoMes() {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  }

  function handleSelecionarDiaDoMes(dataStr) {
    setActiveData(dataStr);
    const d = parseDataLocal(dataStr);
    setMesAtual(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function handleSelecionarMes(mesIdx) {
    setMesExpandidoIndex(mesIdx);
    const d = parseDataLocal(activeData);
    // Navega para o primeiro dia do mês se não há data ativa no mês
    const mesStr = String(mesIdx + 1).padStart(2, '0');
    const prefixo = `${anoVigente}-${mesStr}`;
    const diaAtual = d.getFullYear() === anoVigente && d.getMonth() === mesIdx ? activeData : `${prefixo}-01`;
    setActiveData(diaAtual);
    setMesAtual(new Date(anoVigente, mesIdx, 1));
  }

  function handleAbrirRelatorio(mesIdx, autoDownload = false) {
    const mesAlvo = mesIdx !== undefined && mesIdx !== null ? mesIdx : mesExpandidoIndex;
    setMesSelecionadoRelatorio(mesAlvo);
    setAnoSelecionadoRelatorio(anoVigente);
    setAutoDownloadRelatorio(autoDownload);
    setRelatorioAberto(true);
  }

  // Grade de dias do mini-calendário
  const anoAtual = mesAtual.getFullYear();
  const mesAtualIndex = mesAtual.getMonth();
  const primeiroDiaSemana = new Date(anoAtual, mesAtualIndex, 1).getDay();
  const totalDiasMes = new Date(anoAtual, mesAtualIndex + 1, 0).getDate();

  const diasArray = [];
  for (let i = 0; i < primeiroDiaSemana; i++) diasArray.push(null);
  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const mesFormatado = String(mesAtualIndex + 1).padStart(2, '0');
    const diaFormatado = String(dia).padStart(2, '0');
    const dataStr = `${anoAtual}-${mesFormatado}-${diaFormatado}`;
    diasArray.push({
      dia,
      dataStr,
      temDiaristas: !!contagemPorData[dataStr],
      qtd: contagemPorData[dataStr] || 0,
    });
  }

  const isHoje = activeData === hoje;

  return (
    <div className="space-y-6 w-full">

      {/* Modal do Relatório Mensal */}
      <RelatorioMensalModal
        isOpen={relatorioAberto}
        onClose={() => {
          setRelatorioAberto(false);
          setAutoDownloadRelatorio(false);
        }}
        diaristas={diaristas}
        mesInicial={mesSelecionadoRelatorio}
        anoInicial={anoSelecionadoRelatorio}
        autoDownload={autoDownloadRelatorio}
      />

      {/* ================================================================= */}
      {/* 1. CABEÇALHO PRINCIPAL                                             */}
      {/* ================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-zinc-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all shadow-xs cursor-pointer group shrink-0"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>Controle Diário de Pagamentos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Relação de Diaristas
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Botão Relatório Mensal — Modo Visualização */}
          <button
            id="btn-gerar-relatorio-mensal"
            onClick={() => handleAbrirRelatorio(mesExpandidoIndex, false)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white text-sm font-bold transition-all shadow-md cursor-pointer border border-zinc-700"
            title={`Visualizar Relatório Mensal — ${MESES[mesExpandidoIndex]} ${anoVigente}`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Relatório Mensal (PDF)</span>
          </button>

          {/* Botão Imprimir Relação do Dia */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-bold transition-all shadow-xs cursor-pointer border border-zinc-200"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Dia</span>
          </button>

          {/* Botão CADASTRAR DIARISTA */}
          <button
            id="btn-cadastrar-diarista"
            onClick={onNavigateCadastrar}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-black shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span>CADASTRAR DIARISTA</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. PAINEL DO ANO VIGENTE + SUB-TABELA DE MESES                    */}
      {/* ================================================================= */}
      <div className="bg-gradient-to-br from-white via-zinc-50 to-zinc-100/50 rounded-3xl shadow-xl border border-zinc-200/80 overflow-hidden no-print">
        
        {/* Barra superior: Controles de Ano + Botão para expandir/recolher */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Visão Anual
              </span>
              <span className="text-base font-black text-white">
                Painel do Ano Vigente
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de Ano */}
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700">
              <button
                onClick={() => setAnoVigente(a => a - 1)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
                title="Ano anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <select
                value={anoVigente}
                onChange={(e) => setAnoVigente(parseInt(e.target.value, 10))}
                className="bg-transparent text-white text-sm font-black focus:outline-none cursor-pointer min-w-[56px] text-center"
              >
                {anosDisponiveis.map(a => (
                  <option key={a} value={a} className="bg-zinc-900">{a}</option>
                ))}
              </select>
              <button
                onClick={() => setAnoVigente(a => a + 1)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition cursor-pointer"
                title="Próximo ano"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setMostrarSubTabelaMeses(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-zinc-700 transition cursor-pointer"
            >
              {mostrarSubTabelaMeses ? (
                <><ChevronUp className="w-4 h-4" /><span className="hidden sm:inline">Recolher</span></>
              ) : (
                <><ChevronDown className="w-4 h-4" /><span className="hidden sm:inline">Expandir</span></>
              )}
            </button>
          </div>
        </div>

        {/* Sub-tabela de 12 meses do ano vigente */}
        {mostrarSubTabelaMeses && (
          <div className="p-4 sm:p-6">
            {/* Grid dos 12 Meses */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              {MESES.map((nomeMes, mesIdx) => {
                const mesStr = String(mesIdx + 1).padStart(2, '0');
                const chave = `${anoVigente}-${mesStr}`;
                const metrics = metricasPorMes[chave];
                const isSelecionado = mesExpandidoIndex === mesIdx;
                const isMesHoje = hojeDate.getFullYear() === anoVigente && hojeDate.getMonth() === mesIdx;

                return (
                  <button
                    key={nomeMes}
                    onClick={() => handleSelecionarMes(mesIdx)}
                    className={`relative rounded-2xl border p-3 text-left transition-all cursor-pointer group ${
                      isSelecionado
                        ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-600 shadow-lg shadow-red-600/25 text-white'
                        : metrics
                        ? 'bg-white border-red-200 hover:border-red-400 hover:bg-red-50/40 text-zinc-900 shadow-sm hover:shadow-md'
                        : isMesHoje
                        ? 'bg-zinc-100 border-zinc-400 text-zinc-700 hover:bg-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300'
                    }`}
                  >
                    {/* Indicador "Hoje" */}
                    {isMesHoje && !isSelecionado && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 block" />
                    )}

                    <div className={`text-xs font-black uppercase tracking-wider mb-1 ${isSelecionado ? 'text-red-100' : 'text-zinc-400'}`}>
                      {MESES_ABREV[mesIdx]}
                    </div>
                    <div className={`text-sm font-black ${isSelecionado ? 'text-white' : 'text-zinc-800'}`}>
                      {nomeMes}
                    </div>

                    {metrics ? (
                      <div className="mt-2 space-y-0.5">
                        <div className={`text-[10px] font-bold ${isSelecionado ? 'text-red-100' : 'text-red-700'}`}>
                          R$ {formatarMoeda(metrics.valor)}
                        </div>
                        <div className={`text-[10px] ${isSelecionado ? 'text-red-200' : 'text-zinc-500'}`}>
                          {metrics.diaristasUnicos} diarista(s) únicos
                        </div>
                        <div className={`text-[10px] ${isSelecionado ? 'text-red-200' : 'text-zinc-500'}`}>
                          {metrics.diarias} diária(s)
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-2 text-[10px] ${isSelecionado ? 'text-red-200' : 'text-zinc-400'} italic`}>
                        Sem registros
                      </div>
                    )}

                    {/* Botão rápido de relatório que aparece no hover */}
                    {metrics && !isSelecionado && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirRelatorio(mesIdx, true);
                        }}
                        className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white"
                        title={`Baixar PDF de ${nomeMes}`}
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                    )}
                    {isSelecionado && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAbrirRelatorio(mesIdx, true);
                        }}
                        className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                        title={`Baixar PDF de ${nomeMes}`}
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ============================================================= */}
            {/* SUB-TABELA DOS DIAS DO MÊS SELECIONADO                        */}
            {/* ============================================================= */}
            <div className="rounded-2xl border border-zinc-200 overflow-hidden">
              {/* Cabeçalho da sub-tabela */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-red-200" />
                  <div>
                    <span className="text-[10px] text-red-200 uppercase font-bold block">Sub-tabela do Mês</span>
                    <span className="text-sm font-black">
                      {MESES[mesExpandidoIndex]} de {anoVigente}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {metricasPorMes[`${anoVigente}-${String(mesExpandidoIndex + 1).padStart(2, '0')}`] && (
                    <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-lg text-white">
                      {metricasPorMes[`${anoVigente}-${String(mesExpandidoIndex + 1).padStart(2, '0')}`].totalRegistros} registro(s) no mês
                    </span>
                  )}
                  <button
                    onClick={() => handleAbrirRelatorio(mesExpandidoIndex, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer border border-white/20"
                    title="Gerar relatório mensal em PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Gerar PDF do Mês</span>
                  </button>
                </div>
              </div>

              {/* Grade dos Dias do Mês */}
              <div className="p-3 sm:p-4 bg-white">
                {/* Cabeçalhos dos dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-1.5">
                  {DIAS_SEMANA.map(ds => (
                    <div key={ds} className="text-center text-[10px] font-black text-zinc-400 uppercase py-1">
                      {ds}
                    </div>
                  ))}
                </div>

                {/* Grade dos dias */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Espaços vazios antes do dia 1 */}
                  {Array.from({ length: diasDoMesExpandido[0]?.primeiroDiaSemana || 0 }).map((_, i) => (
                    <div key={`vz-${i}`} className="h-14 sm:h-16 rounded-xl" />
                  ))}

                  {diasDoMesExpandido.map((item) => {
                    const isSelecionado = activeData === item.dataStr;
                    const isItemHoje = item.dataStr === hoje;

                    return (
                      <button
                        key={item.dataStr}
                        onClick={() => handleSelecionarDiaDoMes(item.dataStr)}
                        className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer border text-xs ${
                          isSelecionado
                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-red-600 shadow-md font-black'
                            : item.temLancamento
                            ? 'bg-red-50 hover:bg-red-100 text-red-950 border-red-200 hover:border-red-400 font-black shadow-sm hover:shadow'
                            : isItemHoje
                            ? 'bg-zinc-100 text-zinc-950 border-zinc-400 font-black'
                            : 'bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300'
                        }`}
                        title={item.temLancamento ? `${item.qtd} diarista(s) — R$ ${formatarMoeda(item.valor)}` : `${item.dia}/${String(mesExpandidoIndex + 1).padStart(2, '0')}/${anoVigente}`}
                      >
                        <span className="font-black text-sm">{item.dia}</span>
                        {item.temLancamento && (
                          <span className={`text-[9px] font-bold leading-none mt-0.5 ${isSelecionado ? 'text-red-100' : 'text-red-700'}`}>
                            {item.qtd} {item.qtd === 1 ? 'diar.' : 'diar.'}
                          </span>
                        )}
                        {item.temLancamento && (
                          <span className={`text-[8px] leading-none mt-0.5 font-semibold ${isSelecionado ? 'text-white/70' : 'text-zinc-500'}`}>
                            R${formatarMoeda(item.valor)}
                          </span>
                        )}
                        {isItemHoje && !isSelecionado && (
                          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 3. SELETOR DIÁRIO — NAVEGAÇÃO POR DIA ATIVO                      */}
      {/* ================================================================= */}
      <div className="bg-gradient-to-br from-white via-zinc-50 to-red-50/20 backdrop-blur-md rounded-3xl shadow-xl border-2 border-red-100 p-5 sm:p-7 space-y-4 no-print">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Controles Dia Anterior / Próximo */}
          <div className="flex items-center gap-2">
            <button
              onClick={diaAnterior}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-black border border-zinc-200 shadow-sm hover:shadow transition-all cursor-pointer"
              title="Ir para o Dia Anterior"
            >
              <ChevronLeft className="w-4 h-4 text-red-600" />
              <span>Dia Anterior</span>
            </button>

            <button
              onClick={diaSeguinte}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-black border border-zinc-200 shadow-sm hover:shadow transition-all cursor-pointer"
              title="Ir para o Próximo Dia"
            >
              <span>Próximo Dia</span>
              <ChevronRight className="w-4 h-4 text-red-600" />
            </button>

            <button
              onClick={irParaHoje}
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer border shadow-sm ${
                isHoje
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
              }`}
            >
              Hoje
            </button>
          </div>

          {/* Destaque do Dia Selecionado */}
          <div className="flex-1 max-w-xl bg-white rounded-2xl border border-red-200/80 p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase font-black tracking-wider text-red-600">
                  Dia em Visualização:
                </div>
                <div className="text-lg sm:text-xl font-black text-zinc-950 flex items-center gap-2">
                  <span>{formatarDataBR(activeData)}</span>
                  {isHoje && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase">
                      Hoje
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 font-medium">
                  {formatarDataExtenso(activeData)}
                </div>
              </div>
            </div>

            {/* Input de Data Nativo */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="input-seletor-data"
                className="relative inline-flex items-center justify-center p-2.5 rounded-xl bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-700 border border-zinc-200 hover:border-red-300 transition cursor-pointer"
                title="Escolher outra data no calendário"
              >
                <CalendarDays className="w-4 h-4" />
                <input
                  id="input-seletor-data"
                  type="date"
                  value={activeData}
                  onChange={(e) => {
                    if (e.target.value) {
                      setActiveData(e.target.value);
                      const d = parseDataLocal(e.target.value);
                      setMesAtual(new Date(d.getFullYear(), d.getMonth(), 1));
                      setMesExpandidoIndex(d.getMonth());
                      setAnoVigente(d.getFullYear());
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>

              <button
                onClick={() => setMostrarCalendario(!mostrarCalendario)}
                className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold border border-zinc-200 transition cursor-pointer"
                title="Abrir visão mensal completa"
              >
                {mostrarCalendario ? 'Fechar Mês' : 'Ver Mês'}
              </button>
            </div>
          </div>

          {/* Badge de Resumo do Dia Ativo */}
          <div className="bg-zinc-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-md flex items-center justify-between lg:justify-end gap-4 min-w-[200px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Total do Dia ({formatarDataBR(activeData)}):
              </span>
              <span className="text-lg font-black text-emerald-400">
                R$ {formatarMoeda(totalValorGeral)}
              </span>
            </div>
            <div className="text-right border-l border-zinc-800 pl-3">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Diaristas
              </span>
              <span className="text-base font-black text-white">
                {diaristasDoDia.length}
              </span>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos para Dias Cadastrados */}
        {datasDisponiveis.length > 0 && (
          <div className="pt-3 border-t border-zinc-200/80 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider whitespace-nowrap">
              Dias Cadastrados:
            </span>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {datasDisponiveis.map((data) => {
                const count = contagemPorData[data] || 0;
                const isSelected = activeData === data;
                return (
                  <button
                    key={data}
                    onClick={() => {
                      setActiveData(data);
                      const d = parseDataLocal(data);
                      setMesAtual(new Date(d.getFullYear(), d.getMonth(), 1));
                      setMesExpandidoIndex(d.getMonth());
                      setAnoVigente(d.getFullYear());
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-md font-black'
                        : 'bg-white hover:bg-red-50 text-zinc-700 border-zinc-200 hover:border-red-200 shadow-2xs'
                    }`}
                  >
                    <span>{formatarDataBR(data)}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-red-100 text-red-700'
                    }`}>
                      {count} {count === 1 ? 'diarista' : 'diaristas'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grade do Calendário Mensal Opcional */}
        {mostrarCalendario && (
          <div className="pt-4 border-t border-zinc-200/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center animate-fadeIn">
            <div className="md:col-span-4 bg-zinc-100/80 rounded-2xl p-4 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-zinc-500">Navegar no Mês</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={anteriorMes}
                    className="p-1.5 rounded-xl bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-700 transition cursor-pointer shadow-xs"
                    title="Mês Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={proximoMes}
                    className="p-1.5 rounded-xl bg-white hover:bg-zinc-200 border border-zinc-200 text-zinc-700 transition cursor-pointer shadow-xs"
                    title="Próximo Mês"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-xl font-black text-zinc-900">
                {MESES[mesAtualIndex]} de {anoAtual}
              </div>
              <p className="text-xs text-zinc-600">
                Clique em qualquer dia para filtrar e ver a relação específica daquela data.
              </p>
            </div>

            <div className="md:col-span-8">
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black text-zinc-400 mb-1.5">
                {DIAS_SEMANA.map((diaSemana) => (
                  <div key={diaSemana} className="py-0.5 uppercase text-[11px]">
                    {diaSemana}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {diasArray.map((item, idx) => {
                  if (!item) {
                    return <div key={`vazio-${idx}`} className="h-10 rounded-xl" />;
                  }

                  const isSelecionado = activeData === item.dataStr;
                  const itemIsHoje = item.dataStr === hoje;

                  return (
                    <button
                      key={item.dataStr}
                      type="button"
                      onClick={() => {
                        setActiveData(item.dataStr);
                        const d = parseDataLocal(item.dataStr);
                        setMesExpandidoIndex(d.getMonth());
                        setAnoVigente(d.getFullYear());
                      }}
                      className={`h-10 rounded-xl font-bold text-xs flex flex-col items-center justify-center relative transition-all cursor-pointer border ${
                        isSelecionado
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md font-black'
                          : item.temDiaristas
                          ? 'bg-red-50 hover:bg-red-100 text-red-950 border-red-200 hover:border-red-400 font-black shadow-2xs'
                          : itemIsHoje
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-400 font-black'
                          : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <span>{item.dia}</span>
                      {item.temDiaristas && (
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mt-0.5 ${
                            isSelecionado ? 'bg-white' : 'bg-red-600'
                          }`}
                          title={`${item.qtd} diarista(s)`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 4. TOTALIZADORES EXECUTIVOS DO DIA SELECIONADO                   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-zinc-200/80 shadow-md hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Diaristas no Dia</span>
            <div className="text-2xl font-black text-zinc-900">
              {listaFiltrada.length}{' '}
              <span className="text-xs font-semibold text-zinc-400">
                ({diaristasDoDia.length} no dia)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-zinc-200/80 shadow-md hover:shadow-lg transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Diárias no Dia</span>
            <div className="text-2xl font-black text-zinc-900">
              {totalDiariasQtd}{' '}
              <span className="text-xs font-semibold text-zinc-400">diária(s)</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-3xl p-5 border border-zinc-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total do Dia</span>
            <div className="text-2xl font-black text-emerald-400">
              R$ {formatarMoeda(totalValorGeral)}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. BARRA DE BUSCA                                                 */}
      {/* ================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-zinc-200/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou PIX do dia..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 bg-zinc-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3.5 py-2 rounded-xl border border-zinc-200">
            {listaFiltrada.length} diarista(s) listado(s)
          </span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 6. TABELA PRINCIPAL DA RELAÇÃO DO DIA                            */}
      {/* ================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-zinc-200/80 overflow-hidden w-full no-print">
        
        <div className="p-5 bg-gradient-to-r from-zinc-50 to-zinc-100/70 border-b border-zinc-200/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
              Relação de Diaristas do Dia — {formatarDataBR(activeData)}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-700 bg-white px-3.5 py-1.5 rounded-full border border-zinc-200/80 shadow-2xs">
              {listaFiltrada.length} registro(s) no dia • Total do Dia:{' '}
              <strong className="text-red-600">R$ {formatarMoeda(totalValorGeral)}</strong>
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm table-auto">
            <thead className="bg-zinc-100/90 border-b border-zinc-200 text-zinc-700 text-xs font-black uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Diarista</th>
                <th className="py-3.5 px-3 text-center">Data</th>
                <th className="py-3.5 px-3 text-right">Vlr. Diária</th>
                <th className="py-3.5 px-3 text-center">Qtd. Diárias</th>
                <th className="py-3.5 px-4 text-right bg-red-50/70 text-red-950 font-black border-x border-red-200/70">
                  Total do Diarista
                </th>
                <th className="py-3.5 px-4">Chave PIX</th>
                <th className="py-3.5 px-4 text-center no-print">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200/80">
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-zinc-500">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                        <AlertCircle className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-zinc-800">
                          Nenhum diarista para {formatarDataBR(activeData)}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          {busca
                            ? 'Nenhum diarista encontrado com os termos pesquisados nesta data.'
                            : `Não há diaristas cadastrados para o dia ${formatarDataBR(activeData)}.`}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                        <button
                          onClick={onNavigateCadastrar}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                        >
                          + Cadastrar Diarista para este Dia
                        </button>

                        {!isHoje && (
                          <button
                            onClick={irParaHoje}
                            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200 transition cursor-pointer"
                          >
                            Ir para Hoje ({formatarDataBR(hoje)})
                          </button>
                        )}

                        {onResetDiaristas && diaristas.length === 0 && (
                          <button
                            onClick={onResetDiaristas}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Restaurar Lista Padrão</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((item) => {
                  const qtdDiarias = parseInt(item.diarias, 10) || 1;
                  const valorUnitario = parseFloat(item.valor) || 0;
                  const valorTotalDiarista = valorUnitario * qtdDiarias;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/90 transition-colors group">
                      
                      <td className="py-3.5 px-4 font-black text-zinc-900 uppercase whitespace-nowrap">
                        {item.nome}
                        {(item.motorista || item.profissao) && (
                          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
                            {item.motorista || item.profissao}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center text-xs font-semibold text-zinc-600 whitespace-nowrap">
                        {formatarDataBR(item.data)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-zinc-700 whitespace-nowrap">
                        R$ {valorUnitario.toFixed(2).replace('.', ',')}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-100/90 px-2 py-1 rounded-xl border border-zinc-200 shadow-2xs">
                          {onUpdateDiarista && (
                            <button
                              type="button"
                              onClick={() => handleMudarDiarias(item, -1)}
                              disabled={qtdDiarias <= 1}
                              className="p-1 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition no-print"
                              title="Diminuir quantidade de diárias"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <span className="font-black text-zinc-900 text-xs px-1.5 min-w-[20px] text-center">
                            {qtdDiarias}
                          </span>
                          {onUpdateDiarista && (
                            <button
                              type="button"
                              onClick={() => handleMudarDiarias(item, 1)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-white cursor-pointer transition no-print"
                              title="Aumentar quantidade de diárias"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap bg-red-50/40 border-x border-red-200/60">
                        <div className="font-black text-red-700 text-base tracking-tight">
                          R$ {valorTotalDiarista.toFixed(2).replace('.', ',')}
                        </div>
                        {qtdDiarias > 1 && (
                          <span className="text-[10px] text-zinc-400 block font-semibold">
                            ({qtdDiarias}x R$ {valorUnitario.toFixed(2).replace('.', ',')})
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100/90 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-mono font-semibold text-zinc-800 transition shadow-2xs">
                          <span>{item.pix || 'Não informado'}</span>
                          {item.pix && (
                            <button
                              onClick={() => handleCopiarPix(item.pix, item.id)}
                              className="p-1 text-zinc-400 hover:text-red-600 transition cursor-pointer no-print"
                              title="Copiar Chave PIX"
                            >
                              {copiadoId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap no-print">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEmitirRecibo && onEmitirRecibo(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                            title="Emitir Recibo Individual deste Diarista"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-600" />
                            <span>Recibo</span>
                          </button>

                          {onDeleteDiarista && (
                            <button
                              onClick={() => onDeleteDiarista(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                              title="Remover Diarista"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            <tfoot className="bg-zinc-900 text-white font-black text-sm">
              <tr>
                <td className="py-4 px-4 uppercase tracking-wider">
                  TOTAL DO DIA ({formatarDataBR(activeData)})
                </td>
                <td className="py-4 px-3 text-center text-xs font-semibold text-zinc-400">
                  {listaFiltrada.length} diarista(s)
                </td>
                <td className="py-4 px-3 text-right text-xs text-zinc-400">—</td>
                <td className="py-4 px-3 text-center text-amber-400 text-base font-black">
                  {totalDiariasQtd}
                </td>
                <td className="py-4 px-4 text-right text-emerald-400 text-lg font-black bg-zinc-950/90">
                  R$ {formatarMoeda(totalValorGeral)}
                </td>
                <td colSpan="2" className="py-4 px-4 text-right text-xs font-normal text-zinc-400">
                  Distribuidora Irmãos Barreiro de Bebidas Ltda.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 7. VERSÃO EXCLUSIVA DE IMPRESSÃO LIMPA DO DIA (PRINT)            */}
      {/* ================================================================= */}
      <div className="hidden print:block print-clean p-4 font-sans text-black">
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black uppercase">
              DISTRIBUIDORA IRMÃOS BARREIRO DE BEBIDAS LTDA
            </h2>
            <p className="text-sm font-bold">
              RELAÇÃO DIÁRIA DE DIARISTAS E CONTROLE DE PAGAMENTOS
            </p>
            <p className="text-xs text-zinc-700 font-bold">
              Data de Referência: {formatarDataBR(activeData)} ({formatarDataExtenso(activeData)})
            </p>
          </div>
          <div className="text-right text-xs">
            <p>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="font-bold">Total de Diaristas no Dia: {listaFiltrada.length}</p>
            <p className="font-bold text-sm text-black">Total a Pagar: R$ {formatarMoeda(totalValorGeral)}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left border border-zinc-400">
          <thead>
            <tr className="bg-zinc-200 font-bold uppercase text-[10px]">
              <th className="p-2 border">Diarista</th>
              <th className="p-2 border">Função</th>
              <th className="p-2 border text-center">Data</th>
              <th className="p-2 border text-right">Vlr. Diária</th>
              <th className="p-2 border text-center">Diárias</th>
              <th className="p-2 border text-right">Total (R$)</th>
              <th className="p-2 border">Chave PIX</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-zinc-500 italic">
                  Nenhum diarista cadastrado para esta data.
                </td>
              </tr>
            ) : (
              listaFiltrada.map((item) => {
                const qtd = parseInt(item.diarias, 10) || 1;
                const val = parseFloat(item.valor) || 0;
                return (
                  <tr key={item.id}>
                    <td className="p-2 border font-bold uppercase">{item.nome}</td>
                    <td className="p-2 border">{item.motorista || item.profissao || '—'}</td>
                    <td className="p-2 border text-center">{formatarDataBR(item.data)}</td>
                    <td className="p-2 border text-right">R$ {val.toFixed(2).replace('.', ',')}</td>
                    <td className="p-2 border text-center font-bold">{qtd}</td>
                    <td className="p-2 border text-right font-black">R$ {(val * qtd).toFixed(2).replace('.', ',')}</td>
                    <td className="p-2 border font-mono">{item.pix || '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-zinc-100">
              <td colSpan="4" className="p-2 border uppercase">TOTAL DO DIA ({formatarDataBR(activeData)})</td>
              <td className="p-2 border text-center">{totalDiariasQtd}</td>
              <td className="p-2 border text-right font-black">R$ {formatarMoeda(totalValorGeral)}</td>
              <td className="p-2 border text-right font-semibold text-zinc-600">
                Total: {listaFiltrada.length} diaristas
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 pt-4 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-black w-48 mx-auto mb-1"></div>
            <p className="font-bold">Responsável Financeiro</p>
            <p>Distribuidora Irmãos Barreiro</p>
          </div>
          <div>
            <div className="border-t border-black w-48 mx-auto mb-1"></div>
            <p className="font-bold">Conferido por</p>
            <p>RH</p>
          </div>
        </div>
      </div>

    </div>
  );
}
