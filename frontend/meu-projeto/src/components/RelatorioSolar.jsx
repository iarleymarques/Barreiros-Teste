import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import Logo from './Logo';
import { 
  Sun,
  Calendar, 
  CalendarDays, 
  FileText, 
  Download, 
  Printer, 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  ChevronRight,
  X
} from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function parseDataLocal(dataStr) {
  if (!dataStr) return new Date();
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
  }
  return new Date(dataStr);
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

export default function RelatorioSolar({ diaristas = [], onBack }) {
  const agora = new Date();
  const hojeStr = agora.toISOString().split('T')[0];

  // =========================================================================
  // ESTADOS DE SELEÇÃO: MÊS E DIA
  // =========================================================================
  const [anoSelecionado, setAnoSelecionado] = useState(agora.getFullYear());
  const [mesSelecionadoIndex, setMesSelecionadoIndex] = useState(agora.getMonth());
  const [dataSelecionadaDia, setDataSelecionadaDia] = useState(hojeStr);

  // Estados dos modais de visualização / geração de PDF
  const [modalAtivo, setModalAtivo] = useState(null); // 'mes' | 'dia' | null
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState('');

  // Fecha o modal de PDF ao pressionar ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setModalAtivo(null);
      }
    }
    if (modalAtivo) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalAtivo]);

  // Anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const setAnos = new Set([agora.getFullYear(), anoSelecionado]);
    diaristas.forEach(d => {
      if (d.data) {
        const ano = parseInt(d.data.split('-')[0], 10);
        if (!isNaN(ano)) setAnos.add(ano);
      }
    });
    return Array.from(setAnos).sort((a, b) => b - a);
  }, [diaristas, anoSelecionado]);

  // =========================================================================
  // 1. DADOS DO RELATÓRIO DO MÊS (CONSOLIDADO POR FUNCIONÁRIO)
  // =========================================================================
  const mesFormatado = String(mesSelecionadoIndex + 1).padStart(2, '0');
  const prefixoMesAno = `${anoSelecionado}-${mesFormatado}`;
  const nomeMesExtenso = MESES[mesSelecionadoIndex];
  const ultimoDiaMes = new Date(anoSelecionado, mesSelecionadoIndex + 1, 0).getDate();
  const periodoMesFormatado = `01/${mesFormatado}/${anoSelecionado} a ${String(ultimoDiaMes).padStart(2, '0')}/${mesFormatado}/${anoSelecionado}`;

  const listaMesConsolidada = useMemo(() => {
    const mapa = new Map();

    diaristas.forEach(d => {
      if (!d.data || !d.data.startsWith(prefixoMesAno)) return;
      const nomeLimpo = (d.nome || '').trim().toUpperCase();
      if (!nomeLimpo) return;

      const qtdDiarias = parseInt(d.diarias, 10) || 1;
      const funcao = (d.motorista || d.profissao || 'Auxiliar Geral').trim();

      if (!mapa.has(nomeLimpo)) {
        mapa.set(nomeLimpo, {
          nome: nomeLimpo,
          funcao: funcao || 'Auxiliar Geral',
          quantidadeDiarias: qtdDiarias,
          diasTrabalhados: [d.data]
        });
      } else {
        const reg = mapa.get(nomeLimpo);
        reg.quantidadeDiarias += qtdDiarias;
        if (d.data && !reg.diasTrabalhados.includes(d.data)) {
          reg.diasTrabalhados.push(d.data);
        }
        if ((!reg.funcao || reg.funcao === 'Auxiliar Geral') && funcao) {
          reg.funcao = funcao;
        }
      }
    });

    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [diaristas, prefixoMesAno]);

  const totalDiariasMes = listaMesConsolidada.reduce((acc, curr) => acc + curr.quantidadeDiarias, 0);
  const totalFuncionariosMes = listaMesConsolidada.length;

  // Paginação inteligente A4 do Mês
  const laudasMes = useMemo(() => {
    const lista = listaMesConsolidada;
    const totalItens = lista.length;
    if (totalItens <= 11) {
      return [{
        numero: 1,
        itens: lista,
        isPrimeira: true,
        isUltima: true,
        indexInicial: 0
      }];
    }
    const resultado = [];
    const ITENS_P1 = 11;
    const ITENS_OUTRAS = 15;

    resultado.push({
      numero: 1,
      itens: lista.slice(0, ITENS_P1),
      isPrimeira: true,
      isUltima: false,
      indexInicial: 0
    });

    let cursor = ITENS_P1;
    let numLauda = 2;
    while (cursor < totalItens) {
      const restante = totalItens - cursor;
      const qtdParaPegar = Math.min(ITENS_OUTRAS, restante);
      const isUltima = (cursor + qtdParaPegar) >= totalItens;

      resultado.push({
        numero: numLauda,
        itens: lista.slice(cursor, cursor + qtdParaPegar),
        isPrimeira: false,
        isUltima,
        indexInicial: cursor
      });

      cursor += qtdParaPegar;
      numLauda++;
    }
    return resultado;
  }, [listaMesConsolidada]);

  // =========================================================================
  // 2. DADOS DO RELATÓRIO DO DIA
  // =========================================================================
  const listaDia = useMemo(() => {
    const itens = diaristas.filter(d => d.data === dataSelecionadaDia);
    const mapa = new Map();

    itens.forEach(d => {
      const nomeLimpo = (d.nome || '').trim().toUpperCase();
      if (!nomeLimpo) return;
      const qtd = parseInt(d.diarias, 10) || 1;
      const funcao = (d.motorista || d.profissao || 'Auxiliar Geral').trim();

      if (!mapa.has(nomeLimpo)) {
        mapa.set(nomeLimpo, {
          nome: nomeLimpo,
          funcao: funcao || 'Auxiliar Geral',
          quantidadeDiarias: qtd
        });
      } else {
        const r = mapa.get(nomeLimpo);
        r.quantidadeDiarias += qtd;
        if ((!r.funcao || r.funcao === 'Auxiliar Geral') && funcao) {
          r.funcao = funcao;
        }
      }
    });

    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [diaristas, dataSelecionadaDia]);

  const totalDiariasDia = listaDia.reduce((acc, curr) => acc + curr.quantidadeDiarias, 0);
  const totalFuncionariosDia = listaDia.length;

  // Paginação inteligente A4 do Dia
  const laudasDia = useMemo(() => {
    const lista = listaDia;
    const totalItens = lista.length;
    if (totalItens <= 11) {
      return [{
        numero: 1,
        itens: lista,
        isPrimeira: true,
        isUltima: true,
        indexInicial: 0
      }];
    }
    const resultado = [];
    const ITENS_P1 = 11;
    const ITENS_OUTRAS = 15;

    resultado.push({
      numero: 1,
      itens: lista.slice(0, ITENS_P1),
      isPrimeira: true,
      isUltima: false,
      indexInicial: 0
    });

    let cursor = ITENS_P1;
    let numLauda = 2;
    while (cursor < totalItens) {
      const restante = totalItens - cursor;
      const qtdParaPegar = Math.min(ITENS_OUTRAS, restante);
      const isUltima = (cursor + qtdParaPegar) >= totalItens;

      resultado.push({
        numero: numLauda,
        itens: lista.slice(cursor, cursor + qtdParaPegar),
        isPrimeira: false,
        isUltima,
        indexInicial: cursor
      });

      cursor += qtdParaPegar;
      numLauda++;
    }
    return resultado;
  }, [listaDia]);

  // =========================================================================
  // GERAÇÃO DE PDF MULTILAÚDAS A4 (PADRÃO OFICIAL)
  // =========================================================================
  async function baixarPdf(tipoRelatorio) {
    const className = tipoRelatorio === 'mes' ? '.lauda-solar-mes-pdf' : '.lauda-solar-dia-pdf';
    
    // Se o modal não estiver aberto, abre para renderizar as laudas no DOM
    if (modalAtivo !== tipoRelatorio) {
      setModalAtivo(tipoRelatorio);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    const laudaEls = document.querySelectorAll(className);
    if (!laudaEls || laudaEls.length === 0) return;

    setGerandoPdf(true);
    setSucessoMsg('');

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 250));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      for (let i = 0; i < laudaEls.length; i++) {
        if (i > 0) pdf.addPage();
        const imgData = await toJpeg(laudaEls[i], {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const nomeArquivo = tipoRelatorio === 'mes'
        ? `Relatorio_Mensal_Diaristas_${nomeMesExtenso}_${anoSelecionado}_Irmaos_Barreiro.pdf`
        : `Relatorio_Diario_Diaristas_${dataSelecionadaDia.replace(/-/g, '_')}_Irmaos_Barreiro.pdf`;

      pdf.save(nomeArquivo);

      setSucessoMsg(`PDF gerado com sucesso! (${laudaEls.length} lauda${laudaEls.length > 1 ? 's' : ''})`);
      setTimeout(() => setSucessoMsg(''), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Houve um erro ao gerar o arquivo PDF. Tente novamente.');
    } finally {
      setGerandoPdf(false);
    }
  }

  function handleImprimir() {
    window.print();
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto animate-fadeIn">
      
      {/* ================================================================= */}
      {/* 1. CABEÇALHO DO MÓDULO SOLAR                                      */}
      {/* ================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-zinc-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all shadow-xs cursor-pointer group shrink-0"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1 border border-amber-500/20">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Portal do Colaborador • Módulo Solar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              Relatórios Oficiais Solar
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Escolha entre a emissão do relatório mensal consolidado ou o relatório diário com quitação e total de diárias.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Layout Oficial Irmãos Barreiro</span>
          </div>
        </div>
      </div>

      {/* Notificação flutuante de sucesso no topo */}
      {sucessoMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md no-print animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {sucessoMsg}
          </span>
          <button onClick={() => setSucessoMsg('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. GRID PRINCIPAL COM AS 2 OPÇÕES SOLICITADAS                     */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        
        {/* =============================================================== */}
        {/* OPÇÃO 1: GERAR PDF DO MÊS                                       */}
        {/* =============================================================== */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-zinc-200 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-red-500/10 via-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/25">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-black text-red-700 uppercase tracking-wider">
                Opção 1
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 group-hover:text-red-600 transition-colors">
                Gerar PDF do Mês
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
                Relatório consolidado mensal com <strong>Nome</strong>, <strong>Função</strong>, <strong>Quantidade de Diárias de cada funcionário</strong> e <strong>Total de Diárias no Mês</strong>.
              </p>
            </div>

            {/* Seletores de Mês e Ano */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label htmlFor="solar-mes-select" className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    Mês de Referência:
                  </label>
                  <select
                    id="solar-mes-select"
                    value={mesSelecionadoIndex}
                    onChange={(e) => setMesSelecionadoIndex(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-black text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {MESES.map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <label htmlFor="solar-ano-select" className="block text-[10px] font-black uppercase text-zinc-400 mb-1">
                    Ano:
                  </label>
                  <select
                    id="solar-ano-select"
                    value={anoSelecionado}
                    onChange={(e) => setAnoSelecionado(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-black text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {anosDisponiveis.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mini Resumo das Estatísticas do Mês */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Colaboradores</span>
                  <span className="text-sm font-black text-zinc-800">{totalFuncionariosMes}</span>
                </div>
                <div className="bg-red-50 p-2.5 rounded-xl border border-red-200/80">
                  <span className="text-[9px] uppercase font-bold text-red-600 block">Total Diárias no Mês</span>
                  <span className="text-sm font-black text-red-700">{totalDiariasMes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação do Mês */}
          <div className="pt-6 space-y-2.5">
            <button
              id="btn-solar-visualizar-mes"
              onClick={() => setModalAtivo('mes')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black tracking-wide shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-300" />
              <span>VISUALIZAR RELATÓRIO DO MÊS</span>
            </button>

            <button
              id="btn-solar-baixar-mes"
              onClick={() => baixarPdf('mes')}
              disabled={gerandoPdf}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-black tracking-wide shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${gerandoPdf && modalAtivo === 'mes' ? 'animate-bounce' : ''}`} />
              <span>{gerandoPdf && modalAtivo === 'mes' ? 'GERANDO PDF...' : 'BAIXAR PDF DO MÊS'}</span>
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* OPÇÃO 2: GERAR PDF DO DIA                                       */}
        {/* =============================================================== */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-zinc-200 shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/15 via-orange-500/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <CalendarDays className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-black text-amber-700 uppercase tracking-wider">
                Opção 2
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 group-hover:text-amber-600 transition-colors">
                Gerar PDF do Dia
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
                Relatório diário oficial com <strong>Nome</strong>, <strong>Função</strong>, <strong>Quantidade de Diárias de cada funcionário</strong> e <strong>Total de Diárias no Dia</strong>.
              </p>
            </div>

            {/* Seletor de Data */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="solar-dia-input" className="text-[10px] font-black uppercase text-zinc-400">
                    Data de Referência:
                  </label>
                  <button
                    onClick={() => setDataSelecionadaDia(hojeStr)}
                    className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    Usar data de hoje
                  </button>
                </div>
                <input
                  id="solar-dia-input"
                  type="date"
                  value={dataSelecionadaDia}
                  onChange={(e) => setDataSelecionadaDia(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-black text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Mini Resumo das Estatísticas do Dia */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Colaboradores no Dia</span>
                  <span className="text-sm font-black text-zinc-800">{totalFuncionariosDia}</span>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
                  <span className="text-[9px] uppercase font-bold text-amber-600 block">Total Diárias no Dia</span>
                  <span className="text-sm font-black text-amber-700">{totalDiariasDia}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação do Dia */}
          <div className="pt-6 space-y-2.5">
            <button
              id="btn-solar-visualizar-dia"
              onClick={() => setModalAtivo('dia')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black tracking-wide shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-300" />
              <span>VISUALIZAR RELATÓRIO DO DIA</span>
            </button>

            <button
              id="btn-solar-baixar-dia"
              onClick={() => baixarPdf('dia')}
              disabled={gerandoPdf}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black tracking-wide shadow-lg shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${gerandoPdf && modalAtivo === 'dia' ? 'animate-bounce' : ''}`} />
              <span>{gerandoPdf && modalAtivo === 'dia' ? 'GERANDO PDF...' : 'BAIXAR PDF DO DIA'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ================================================================= */}
      {/* 3. MODAL DE VISUALIZAÇÃO E EMISSÃO DE LAUDAS A4 (MÊS OU DIA)       */}
      {/* ================================================================= */}
      {modalAtivo && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAtivo(null);
          }}
        >
          <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-700/50 overflow-hidden flex flex-col h-[94vh] max-h-[94vh] relative">
            
            {/* Topo do Modal */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-white p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 no-print shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-red-300">
                    <Sparkles className="w-3 h-3 text-red-400" />
                    <span>Emissão Oficial em PDF • {modalAtivo === 'mes' ? `${laudasMes.length} lauda(s)` : `${laudasDia.length} lauda(s)`}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                    {modalAtivo === 'mes'
                      ? `Relatório Mensal de Diaristas — ${nomeMesExtenso} de ${anoSelecionado}`
                      : `Relatório Diário de Diaristas — ${formatarDataBR(dataSelecionadaDia)}`}
                  </h2>
                </div>
              </div>

              {/* Botões do topo do modal */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => baixarPdf(modalAtivo)}
                  disabled={gerandoPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
                  title="Baixar arquivo PDF oficial"
                >
                  <Download className={`w-4 h-4 ${gerandoPdf ? 'animate-bounce' : ''}`} />
                  <span>{gerandoPdf ? 'GERANDO PDF...' : 'BAIXAR PDF'}</span>
                </button>

                <button
                  onClick={handleImprimir}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition cursor-pointer"
                  title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>

                <button
                  onClick={() => setModalAtivo(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                  title="Fechar visualização (ou pressione ESC)"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                  <span>FECHAR</span>
                </button>
              </div>
            </div>

            {/* Aviso de renderização do PDF */}
            {gerandoPdf && (
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 text-xs font-black flex items-center justify-between shadow-inner no-print animate-pulse">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                  <span>Gerando arquivo oficial A4 em alta resolução... O download iniciará em instantes!</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Processando Laudas
                </span>
              </div>
            )}

            {/* Container das Laudas A4 Oficiais */}
            <div className="overflow-y-auto p-4 sm:p-8 bg-zinc-200/80 flex-grow flex flex-col items-center gap-8">
              
              {/* ========================================================= */}
              {/* RENDERIZAÇÃO DAS LAUDAS DO MÊS                            */}
              {/* ========================================================= */}
              {modalAtivo === 'mes' && (
                laudasMes.map((lauda) => (
                  <div
                    key={`solar-mes-lauda-${lauda.numero}`}
                    className="lauda-solar-mes-pdf w-[800px] min-h-[1130px] max-h-[1130px] bg-white text-zinc-950 p-10 rounded-xl shadow-2xl border border-zinc-300 flex flex-col justify-between shrink-0 relative overflow-hidden"
                    style={{
                      boxSizing: 'border-box',
                      aspectRatio: '210 / 297'
                    }}
                  >
                    <div>
                      {/* Cabeçalho da lauda */}
                      {lauda.isPrimeira ? (
                        <div className="border-b-4 border-red-600 pb-4 mb-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Logo className="h-12 w-auto" />
                              <div className="border-l-2 border-zinc-200 pl-3">
                                <h1 className="text-base font-black tracking-tight text-zinc-900 leading-tight uppercase">
                                  Distribuidora Irmãos Barreiro
                                </h1>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                  De Bebidas Ltda. • CNPJ: 01.688.096/0001-95 • Financeiro
                                </p>
                              </div>
                            </div>

                            <div className="text-right text-[10px] text-zinc-500">
                              <p className="font-semibold">
                                Emissão: <strong className="text-zinc-800">{new Date().toLocaleDateString('pt-BR')}</strong> às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-red-600 font-black uppercase text-[11px]">
                                Documento Oficial de Diárias
                              </p>
                            </div>
                          </div>

                          {/* Banner do Título */}
                          <div className="mt-3 pt-3 border-t border-zinc-100 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-xl p-3.5 shadow-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-200 block">
                                  Relação Consolidada de Diaristas
                                </span>
                                <h2 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                                  RELATÓRIO MENSAL — {nomeMesExtenso} de {anoSelecionado}
                                </h2>
                              </div>
                              <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/20 text-right">
                                <span className="text-[8px] uppercase font-bold text-red-100 block">Período de Apuração:</span>
                                <span className="text-[11px] font-black text-white">{periodoMesFormatado}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cards Estatísticos */}
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-center">
                              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">
                                Total de Funcionários
                              </span>
                              <span className="text-base font-black text-zinc-900">
                                {totalFuncionariosMes}
                              </span>
                            </div>

                            <div className="bg-red-50/90 border border-red-200 rounded-xl p-2.5 text-center col-span-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-red-700 block">
                                Total de Diárias no Mês
                              </span>
                              <span className="text-lg font-black text-red-700">
                                {totalDiariasMes} {totalDiariasMes === 1 ? 'DIÁRIA' : 'DIÁRIAS'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-b-2 border-red-600 pb-2.5 mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Logo className="h-8 w-auto" />
                            <div className="border-l border-zinc-300 pl-2.5">
                              <span className="text-xs font-black uppercase tracking-tight text-zinc-900 block">
                                Distribuidora Irmãos Barreiro
                              </span>
                              <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider">
                                Relatório Mensal — {nomeMesExtenso} de {anoSelecionado} (Continuação)
                              </span>
                            </div>
                          </div>

                          <div className="text-right text-[9px] text-zinc-500">
                            <p>Período: <strong className="text-zinc-800">{periodoMesFormatado}</strong></p>
                            <p className="font-bold text-red-700">Lauda {lauda.numero} de {laudasMes.length}</p>
                          </div>
                        </div>
                      )}

                      {/* Tabela do Mês com os 4 tópicos exigidos: Nome, Quantidade de Diárias de cada funcionário, Total de Diárias no Mês e Função */}
                      <div className="overflow-hidden border border-zinc-300 rounded-lg">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-gradient-to-r from-red-700 to-red-800 text-white font-black uppercase text-[10px] tracking-wider">
                              <th className="py-2.5 px-3 border border-red-900 w-12 text-center">#</th>
                              <th className="py-2.5 px-4 border border-red-900">Nome do Funcionário</th>
                              <th className="py-2.5 px-4 border border-red-900">Função</th>
                              <th className="py-2.5 px-3 border border-red-900 text-center w-36">Quantidade de Diárias</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lauda.itens.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="py-12 text-center text-zinc-500 border border-zinc-200 bg-zinc-50/50">
                                  <AlertCircle className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                                  <p className="font-bold text-xs text-zinc-700">
                                    Nenhum funcionário com diárias registradas em {nomeMesExtenso} de {anoSelecionado}
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              lauda.itens.map((func, idx) => {
                                const numGlobal = lauda.indexInicial + idx + 1;
                                const isPar = idx % 2 === 1;
                                return (
                                  <tr
                                    key={`solar-m-row-${func.nome}-${numGlobal}`}
                                    className={`${isPar ? 'bg-zinc-50/80' : 'bg-white'} border-b border-zinc-200`}
                                  >
                                    <td className="py-2 px-3 border-r border-zinc-200 text-center font-bold text-zinc-500">
                                      {numGlobal}
                                    </td>
                                    <td className="py-2 px-4 border-r border-zinc-200 font-black text-zinc-950 uppercase tracking-tight">
                                      {func.nome}
                                    </td>
                                    <td className="py-2 px-4 border-r border-zinc-200 font-semibold text-zinc-700">
                                      {func.funcao}
                                    </td>
                                    <td className="py-2 px-3 border-r border-zinc-200 text-center font-black text-zinc-900 bg-red-50/30">
                                      <span className="inline-block px-3 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[11px]">
                                        {func.quantidadeDiarias} {func.quantidadeDiarias === 1 ? 'diária' : 'diárias'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>

                          {/* Rodapé da tabela com o TOTAL DE DIÁRIAS NO MÊS */}
                          {lauda.isUltima && (
                            <tfoot>
                              <tr className="bg-zinc-900 text-white font-black text-[11px]">
                                <td colSpan="3" className="py-3 px-4 uppercase tracking-wider text-left border border-zinc-800">
                                  TOTAL DE DIÁRIAS NO MÊS ({nomeMesExtenso.toUpperCase()} / {anoSelecionado})
                                </td>
                                <td className="py-3 px-3 text-center text-amber-400 font-black text-xs border border-zinc-800 whitespace-nowrap bg-zinc-950">
                                  {totalDiariasMes} {totalDiariasMes === 1 ? 'DIÁRIA' : 'DIÁRIAS'}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      {lauda.isUltima && (
                        <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[9px] text-zinc-500 leading-snug">
                          <p>
                            * <strong>Relatório Oficial de Diárias:</strong> Registro oficial de presenças e diárias de prestadores de serviços da Distribuidora Irmãos Barreiro referente ao mês de {nomeMesExtenso} de {anoSelecionado}.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rodapé e Assinaturas */}
                    <div>
                      {lauda.isUltima ? (
                        <div className="pt-4 border-t-2 border-zinc-300">
                          <div className="grid grid-cols-2 gap-8 text-center text-[10px]">
                            <div>
                              <div className="border-t border-zinc-800 w-48 mx-auto mb-1"></div>
                              <p className="font-black text-zinc-900 uppercase">Responsável Financeiro</p>
                              <p className="text-[9px] text-zinc-500">Distribuidora Irmãos Barreiro de Bebidas Ltda.</p>
                            </div>

                            <div>
                              <div className="border-t border-zinc-800 w-48 mx-auto mb-1"></div>
                              <p className="font-black text-zinc-900 uppercase">Gerência Administrativa / RH</p>
                              <p className="text-[9px] text-zinc-500">Conferência e Quitação de Diárias</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-between text-[8px] text-zinc-400">
                            <span>Distribuidora Irmãos Barreiro de Bebidas Ltda. • Sistema de Gestão e Controle Operacional</span>
                            <span className="font-bold text-zinc-600">Lauda {lauda.numero} de {laudasMes.length}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[8px] text-zinc-400">
                          <span>Distribuidora Irmãos Barreiro • Relatório Mensal ({nomeMesExtenso}/{anoSelecionado}) — Continua</span>
                          <span className="font-black text-red-600 text-[9px]">Lauda {lauda.numero} de {laudasMes.length}</span>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}

              {/* ========================================================= */}
              {/* RENDERIZAÇÃO DAS LAUDAS DO DIA                            */}
              {/* ========================================================= */}
              {modalAtivo === 'dia' && (
                laudasDia.map((lauda) => (
                  <div
                    key={`solar-dia-lauda-${lauda.numero}`}
                    className="lauda-solar-dia-pdf w-[800px] min-h-[1130px] max-h-[1130px] bg-white text-zinc-950 p-10 rounded-xl shadow-2xl border border-zinc-300 flex flex-col justify-between shrink-0 relative overflow-hidden"
                    style={{
                      boxSizing: 'border-box',
                      aspectRatio: '210 / 297'
                    }}
                  >
                    <div>
                      {/* Cabeçalho da lauda */}
                      {lauda.isPrimeira ? (
                        <div className="border-b-4 border-red-600 pb-4 mb-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Logo className="h-12 w-auto" />
                              <div className="border-l-2 border-zinc-200 pl-3">
                                <h1 className="text-base font-black tracking-tight text-zinc-900 leading-tight uppercase">
                                  Distribuidora Irmãos Barreiro
                                </h1>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                  De Bebidas Ltda. • CNPJ: 01.688.096/0001-95 • Financeiro
                                </p>
                              </div>
                            </div>

                            <div className="text-right text-[10px] text-zinc-500">
                              <p className="font-semibold">
                                Emissão: <strong className="text-zinc-800">{new Date().toLocaleDateString('pt-BR')}</strong> às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-red-600 font-black uppercase text-[11px]">
                                Documento Oficial de Diárias
                              </p>
                            </div>
                          </div>

                          {/* Banner do Título */}
                          <div className="mt-3 pt-3 border-t border-zinc-100 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white rounded-xl p-3.5 shadow-xs">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-200 block">
                                  Relação Diária de Diaristas
                                </span>
                                <h2 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                                  RELATÓRIO DIÁRIO — {formatarDataBR(dataSelecionadaDia)}
                                </h2>
                              </div>
                              <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/20 text-right">
                                <span className="text-[8px] uppercase font-bold text-red-100 block">Data de Referência:</span>
                                <span className="text-[11px] font-black text-white">{formatarDataBR(dataSelecionadaDia)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cards Estatísticos */}
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-center">
                              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">
                                Funcionários no Dia
                              </span>
                              <span className="text-base font-black text-zinc-900">
                                {totalFuncionariosDia}
                              </span>
                            </div>

                            <div className="bg-red-50/90 border border-red-200 rounded-xl p-2.5 text-center col-span-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-red-700 block">
                                Total de Diárias no Dia
                              </span>
                              <span className="text-lg font-black text-red-700">
                                {totalDiariasDia} {totalDiariasDia === 1 ? 'DIÁRIA' : 'DIÁRIAS'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-b-2 border-red-600 pb-2.5 mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Logo className="h-8 w-auto" />
                            <div className="border-l border-zinc-300 pl-2.5">
                              <span className="text-xs font-black uppercase tracking-tight text-zinc-900 block">
                                Distribuidora Irmãos Barreiro
                              </span>
                              <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider">
                                Relatório Diário — {formatarDataBR(dataSelecionadaDia)} (Continuação)
                              </span>
                            </div>
                          </div>

                          <div className="text-right text-[9px] text-zinc-500">
                            <p>Data: <strong className="text-zinc-800">{formatarDataBR(dataSelecionadaDia)}</strong></p>
                            <p className="font-bold text-red-700">Lauda {lauda.numero} de {laudasDia.length}</p>
                          </div>
                        </div>
                      )}

                      {/* Tabela do Dia com os 4 tópicos exigidos: Nome, Quantidade de Diárias de cada funcionário, Total de Diárias no Dia e Função */}
                      <div className="overflow-hidden border border-zinc-300 rounded-lg">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-gradient-to-r from-red-700 to-red-800 text-white font-black uppercase text-[10px] tracking-wider">
                              <th className="py-2.5 px-3 border border-red-900 w-12 text-center">#</th>
                              <th className="py-2.5 px-4 border border-red-900">Nome do Funcionário</th>
                              <th className="py-2.5 px-4 border border-red-900">Função</th>
                              <th className="py-2.5 px-3 border border-red-900 text-center w-36">Quantidade de Diárias</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lauda.itens.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="py-12 text-center text-zinc-500 border border-zinc-200 bg-zinc-50/50">
                                  <AlertCircle className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                                  <p className="font-bold text-xs text-zinc-700">
                                    Nenhum funcionário com diárias registradas no dia {formatarDataBR(dataSelecionadaDia)}
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              lauda.itens.map((func, idx) => {
                                const numGlobal = lauda.indexInicial + idx + 1;
                                const isPar = idx % 2 === 1;
                                return (
                                  <tr
                                    key={`solar-d-row-${func.nome}-${numGlobal}`}
                                    className={`${isPar ? 'bg-zinc-50/80' : 'bg-white'} border-b border-zinc-200`}
                                  >
                                    <td className="py-2 px-3 border-r border-zinc-200 text-center font-bold text-zinc-500">
                                      {numGlobal}
                                    </td>
                                    <td className="py-2 px-4 border-r border-zinc-200 font-black text-zinc-950 uppercase tracking-tight">
                                      {func.nome}
                                    </td>
                                    <td className="py-2 px-4 border-r border-zinc-200 font-semibold text-zinc-700">
                                      {func.funcao}
                                    </td>
                                    <td className="py-2 px-3 border-r border-zinc-200 text-center font-black text-zinc-900 bg-red-50/30">
                                      <span className="inline-block px-3 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[11px]">
                                        {func.quantidadeDiarias} {func.quantidadeDiarias === 1 ? 'diária' : 'diárias'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>

                          {/* Rodapé da tabela com o TOTAL DE DIÁRIAS NO DIA */}
                          {lauda.isUltima && (
                            <tfoot>
                              <tr className="bg-zinc-900 text-white font-black text-[11px]">
                                <td colSpan="3" className="py-3 px-4 uppercase tracking-wider text-left border border-zinc-800">
                                  TOTAL DE DIÁRIAS NO DIA ({formatarDataBR(dataSelecionadaDia)})
                                </td>
                                <td className="py-3 px-3 text-center text-amber-400 font-black text-xs border border-zinc-800 whitespace-nowrap bg-zinc-950">
                                  {totalDiariasDia} {totalDiariasDia === 1 ? 'DIÁRIA' : 'DIÁRIAS'}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>

                      {lauda.isUltima && (
                        <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[9px] text-zinc-500 leading-snug">
                          <p>
                            * <strong>Relatório Diário Oficial:</strong> Documento diário de controle de presenças e diárias prestadas na Distribuidora Irmãos Barreiro no dia {formatarDataBR(dataSelecionadaDia)}.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rodapé e Assinaturas */}
                    <div>
                      {lauda.isUltima ? (
                        <div className="pt-4 border-t-2 border-zinc-300">
                          <div className="grid grid-cols-2 gap-8 text-center text-[10px]">
                            <div>
                              <div className="border-t border-zinc-800 w-48 mx-auto mb-1"></div>
                              <p className="font-black text-zinc-900 uppercase">Responsável Financeiro</p>
                              <p className="text-[9px] text-zinc-500">Distribuidora Irmãos Barreiro de Bebidas Ltda.</p>
                            </div>

                            <div>
                              <div className="border-t border-zinc-800 w-48 mx-auto mb-1"></div>
                              <p className="font-black text-zinc-900 uppercase">Gerência Administrativa / RH</p>
                              <p className="text-[9px] text-zinc-500">Conferência e Quitação de Diárias</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-between text-[8px] text-zinc-400">
                            <span>Distribuidora Irmãos Barreiro de Bebidas Ltda. • Sistema de Gestão e Controle Operacional</span>
                            <span className="font-bold text-zinc-600">Lauda {lauda.numero} de {laudasDia.length}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[8px] text-zinc-400">
                          <span>Distribuidora Irmãos Barreiro • Relatório Diário ({formatarDataBR(dataSelecionadaDia)}) — Continua</span>
                          <span className="font-black text-red-600 text-[9px]">Lauda {lauda.numero} de {laudasDia.length}</span>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
