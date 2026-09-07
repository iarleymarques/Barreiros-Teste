import React, { useState, useEffect } from 'react';
import { emitirReciboApi } from '../services/api';
import { 
  FileText, 
  Printer, 
  ArrowLeft, 
  Copy, 
  Check, 
  User, 
  DollarSign, 
  Calendar, 
  Truck, 
  CreditCard, 
  Download,
  Building2,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  AlertCircle,
  ShieldCheck,
  Receipt,
  Save
} from 'lucide-react';

function numeroPorExtenso(valor) {
  const v = parseFloat(valor) || 0;
  const inteiros = Math.floor(v);

  const unidades = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove'];
  const especiais = ['Dez', 'Onze', 'Doze', 'Treze', 'Quatorze', 'Quinze', 'Dezesseis', 'Dezessete', 'Dezoito', 'Dezenove'];
  const dezenas = ['', 'Dez', 'Vinte', 'Trinta', 'Quarenta', 'Cinquenta', 'Sessenta', 'Setenta', 'Oitenta', 'Noventa'];
  const centenas = ['', 'Cento', 'Duzentos', 'Trezentos', 'Quatrocentos', 'Quinhentos', 'Seiscentos', 'Setecentos', 'Oitocentos', 'Novecentos'];

  if (inteiros === 0) return 'Zero Reais';
  if (inteiros === 100) return 'Cem Reais';

  let extenso = '';

  if (inteiros >= 1000) {
    const mil = Math.floor(inteiros / 1000);
    const restoMil = inteiros % 1000;
    extenso += (mil === 1 ? 'Mil' : `${unidades[mil]} Mil`);
    if (restoMil > 0) extenso += ' e ';
  }

  const c = Math.floor((inteiros % 1000) / 100);
  const restoC = inteiros % 100;

  if (c > 0) {
    extenso += centenas[c];
    if (restoC > 0) extenso += ' e ';
  }

  if (restoC >= 10 && restoC <= 19) {
    extenso += especiais[restoC - 10];
  } else if (restoC > 0) {
    const d = Math.floor(restoC / 10);
    const u = restoC % 10;
    if (d > 0) {
      extenso += dezenas[d];
      if (u > 0) extenso += ' e ';
    }
    if (u > 0) {
      extenso += unidades[u];
    }
  }

  extenso = extenso.trim() + (inteiros === 1 ? ' Real' : ' Reais');
  return extenso;
}

function getHojeISO() {
  return new Date().toISOString().split('T')[0];
}

function formatarDataPorExtenso(dataStr) {
  const str = dataStr || getHojeISO();
  try {
    const [ano, mes, dia] = str.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const mesIndex = parseInt(mes, 10) - 1;
    return `Cascavel, ${parseInt(dia, 10)} de ${meses[mesIndex]} de ${ano}`;
  } catch {
    const hoje = new Date();
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `Cascavel, ${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
  }
}

export default function ReciboIndividual({ diaristaInicial, diaristas = [], onUpdateDiarista, onBack }) {
  const [diaristaId, setDiaristaId] = useState(diaristaInicial?.id || null);
  const [dadosRecibo, setDadosRecibo] = useState({
    nome: 'Daniel Felipe da Silva',
    cpf: '085.610.493-08',
    valorUnitario: 70.0,
    diarias: 1,
    pago: true,
    referente: 'pagamento de 01 diária trabalhada e almoço',
    empresa: 'DISTRIBUIDORA IRMÃOS BARREIRO DE BEBIDAS LTDA',
    cidade: 'Cascavel',
    data: new Date().toISOString().split('T')[0],
    pix: '085.610.493-08',
    motorista: 'Motorista Felipe',
    profissao: '',
  });

  const [copiadoPix, setCopiadoPix] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [reciboSalvo, setReciboSalvo] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Se receber um diarista inicial vindo da relação
  useEffect(() => {
    if (diaristaInicial) {
      const diariasQtd = parseInt(diaristaInicial.diarias, 10) || 1;
      const refTexto = diariasQtd > 1 
        ? `pagamento de ${String(diariasQtd).padStart(2, '0')} diárias trabalhadas e almoço`
        : 'pagamento de 01 diária trabalhada e almoço';

      setDiaristaId(diaristaInicial.id);
      setReciboSalvo(null);
      setDadosRecibo({
        nome: diaristaInicial.nome || '',
        cpf: diaristaInicial.tipoPix === 'cpf' ? diaristaInicial.pix : '',
        valorUnitario: parseFloat(diaristaInicial.valor) || 70.0,
        diarias: diariasQtd,
        pago: diaristaInicial.pago ?? true,
        referente: refTexto,
        empresa: 'DISTRIBUIDORA IRMÃOS BARREIRO DE BEBIDAS LTDA',
        cidade: 'Cascavel',
        data: diaristaInicial.data || new Date().toISOString().split('T')[0],
        pix: diaristaInicial.pix || '',
        motorista: diaristaInicial.motorista || '',
        profissao: diaristaInicial.profissao || '',
      });
    }
  }, [diaristaInicial]);

  function handleSelecionarDiarista(e) {
    const id = e.target.value;
    if (!id) return;
    const selecionado = diaristas.find((d) => d.id === id);
    if (selecionado) {
      const diariasQtd = parseInt(selecionado.diarias, 10) || 1;
      const refTexto = diariasQtd > 1 
        ? `pagamento de ${String(diariasQtd).padStart(2, '0')} diárias trabalhadas e almoço`
        : 'pagamento de 01 diária trabalhada e almoço';

      setDiaristaId(selecionado.id);
      setReciboSalvo(null);
      setDadosRecibo((prev) => ({
        ...prev,
        nome: selecionado.nome,
        cpf: selecionado.tipoPix === 'cpf' ? selecionado.pix : prev.cpf,
        valorUnitario: parseFloat(selecionado.valor) || 70.0,
        diarias: diariasQtd,
        pago: selecionado.pago ?? true,
        referente: refTexto,
        pix: selecionado.pix || '',
        data: selecionado.data || prev.data,
        motorista: selecionado.motorista || prev.motorista,
        profissao: selecionado.profissao || prev.profissao,
      }));
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setDadosRecibo((prev) => {
      const atualizado = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'diarias') {
        const dQtd = parseInt(value, 10) || 1;
        atualizado.referente = dQtd > 1 
          ? `pagamento de ${String(dQtd).padStart(2, '0')} diárias trabalhadas e almoço`
          : 'pagamento de 01 diária trabalhada e almoço';
      }

      return atualizado;
    });
  }

  function handleMudarDiarias(delta) {
    setDadosRecibo((prev) => {
      const novaQtd = Math.max(1, (parseInt(prev.diarias, 10) || 1) + delta);
      const refTexto = novaQtd > 1 
        ? `pagamento de ${String(novaQtd).padStart(2, '0')} diárias trabalhadas e almoço`
        : 'pagamento de 01 diária trabalhada e almoço';
      
      if (diaristaId && onUpdateDiarista) {
        onUpdateDiarista({ id: diaristaId, diarias: novaQtd });
      }

      return {
        ...prev,
        diarias: novaQtd,
        referente: refTexto,
      };
    });
  }

  function handleTogglePago(novoStatus) {
    setDadosRecibo((prev) => {
      const updated = { ...prev, pago: novoStatus };
      if (diaristaId && onUpdateDiarista) {
        onUpdateDiarista({ id: diaristaId, pago: novoStatus });
      }
      return updated;
    });
  }

  function handleCopiarPix() {
    if (!dadosRecibo.pix) return;
    navigator.clipboard.writeText(dadosRecibo.pix);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2000);
  }

  // Cálculos de valor
  const qtdDiarias = parseInt(dadosRecibo.diarias, 10) || 1;
  const valorUnit = parseFloat(dadosRecibo.valorUnitario) || 0;
  const valorTotalCalculado = valorUnit * qtdDiarias;
  const valorExtenso = numeroPorExtenso(valorTotalCalculado);
  const dataFormatada = formatarDataPorExtenso(dadosRecibo.data);

  // Salvar no Banco de Dados PostgreSQL
  async function handleSalvarRecibo(silent = false) {
    try {
      setSalvando(true);
      setMensagemErro('');
      setMensagemSucesso('');

      const payload = {
        diarista_id: diaristaId || null,
        nome_diarista: dadosRecibo.nome || 'Não informado',
        cpf_diarista: dadosRecibo.cpf || null,
        funcao: dadosRecibo.profissao || null,
        valor_unitario: valorUnit,
        dias_trabalhados: qtdDiarias,
        tem_almoco: true,
        valor_almoco: 0.0,
        valor_total: valorTotalCalculado,
        valor_extenso: valorExtenso,
        tipo_pix: 'cpf',
        chave_pix: dadosRecibo.pix || null,
        data_referencia: dadosRecibo.data || getHojeISO(),
        status_pagamento: Boolean(dadosRecibo.pago),
        observacoes: dadosRecibo.referente || '',
      };

      const resultado = await emitirReciboApi(payload);
      setReciboSalvo(resultado);
      setMensagemSucesso(`Recibo nº ${resultado.numero_recibo} registrado com sucesso no banco de dados!`);
      return resultado;
    } catch (err) {
      console.error('Erro ao salvar recibo:', err);
      if (!silent) {
        setMensagemErro(err.message || 'Erro ao registrar recibo no banco de dados.');
      }
      return null;
    } finally {
      setSalvando(false);
    }
  }

  async function handleImprimir() {
    if (!reciboSalvo) {
      await handleSalvarRecibo(true);
    }
    window.print();
  }

  return (
    <div className="space-y-6">
      
      {/* Topo / Barra de Navegação */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-zinc-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all shadow-xs cursor-pointer group"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
              <Receipt className="w-3.5 h-3.5 text-red-600" />
              <span>Emissão Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Recibo Individual de Diária
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Botão Salvar no Banco de Dados */}
          <button
            onClick={() => handleSalvarRecibo(false)}
            disabled={salvando}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition cursor-pointer disabled:opacity-60 ${
              reciboSalvo
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                : 'bg-zinc-900 hover:bg-black text-white shadow-zinc-900/30 hover:shadow-zinc-900/50 transform hover:-translate-y-0.5'
            }`}
          >
            {salvando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando no Banco...</span>
              </>
            ) : reciboSalvo ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Salvo no Banco ({reciboSalvo.numero_recibo})</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-zinc-300" />
                <span>Salvar no Banco</span>
              </>
            )}
          </button>

          {/* Botão Imprimir Recibo */}
          <button
            onClick={handleImprimir}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transform hover:-translate-y-0.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback de Sucesso */}
      {mensagemSucesso && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-md no-print animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">{mensagemSucesso}</p>
              <p className="text-xs text-emerald-700">O comprovante foi gravado na tabela <span className="font-mono font-semibold">public.recibos</span> com criptografia segura.</p>
            </div>
          </div>
          <button 
            onClick={() => setMensagemSucesso('')}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-bold px-2 py-1 rounded-lg"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Banner de Feedback de Erro */}
      {mensagemErro && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center justify-between shadow-md no-print animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="font-bold text-sm">{mensagemErro}</p>
          </div>
          <button 
            onClick={() => setMensagemErro('')}
            className="text-xs text-red-600 hover:text-red-900 font-bold px-2 py-1 rounded-lg"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Grid: Painel de Edição à Esquerda + Visualização do Recibo à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel de Edição à Esquerda */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-zinc-200/80 space-y-5">
            
            {/* Seleção de Diarista Cadastrado */}
            {diaristas.length > 0 && (
              <div>
                <label className="block text-xs font-black uppercase text-red-700 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Preencher com Diarista Cadastrado
                </label>
                <select
                  onChange={handleSelecionarDiarista}
                  value={diaristaId || ''}
                  className="w-full px-4 py-3 rounded-2xl border border-red-200 bg-red-50/50 text-sm font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  <option value="" disabled>Selecione um diarista para autopreencher...</option>
                  {diaristas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome} - {d.diarias || 1} diária(s) (Total: R$ {((parseFloat(d.valor) || 0) * (d.diarias || 1)).toFixed(2).replace('.', ',')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campos de Dados */}
            <div className="pt-2 border-t border-zinc-100 space-y-4">



              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                  Nome do Diarista / Colaborador
                </label>
                <input
                  type="text"
                  name="nome"
                  value={dadosRecibo.nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                />
              </div>

              {/* Valores e Quantidade de Diárias */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Valor Diária (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="valorUnitario"
                      value={dadosRecibo.valorUnitario}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Qtd. de Diárias
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMudarDiarias(-1)}
                      disabled={qtdDiarias <= 1}
                      className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      name="diarias"
                      value={dadosRecibo.diarias}
                      onChange={handleChange}
                      className="w-full px-2 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-center text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleMudarDiarias(1)}
                      className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD DE TOTAL CALCULADO DO RECIBO */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black text-red-200 uppercase block tracking-wider">
                    Total a Pagar / Quitado:
                  </span>
                  <span className="text-xs text-red-100 font-semibold">
                    {qtdDiarias}x de R$ {valorUnit.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="text-2xl font-black tracking-tight">
                  R$ {valorTotalCalculado.toFixed(2).replace('.', ',')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    CPF
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={dadosRecibo.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Data da Emissão
                  </label>
                  <input
                    type="date"
                    name="data"
                    value={dadosRecibo.data}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                  Referente a
                </label>
                <input
                  type="text"
                  name="referente"
                  value={dadosRecibo.referente}
                  onChange={handleChange}
                  placeholder="pagamento de diárias trabalhadas e almoço"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    name="pix"
                    value={dadosRecibo.pix}
                    onChange={handleChange}
                    placeholder="Chave PIX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1.5">
                    Função
                  </label>
                  <input
                    type="text"
                    name="profissao"
                    value={dadosRecibo.profissao}
                    onChange={handleChange}
                    placeholder="Ex: Ajudante de Carga"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Ação Rápida de Copiar PIX */}
            {dadosRecibo.pix && (
              <button
                type="button"
                onClick={handleCopiarPix}
                className="w-full py-3 px-4 rounded-2xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                {copiadoPix ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 animate-bounce" />
                    <span className="text-emerald-700 font-black">Chave PIX copiada com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-500" />
                    <span>Copiar Chave PIX ({dadosRecibo.pix})</span>
                  </>
                )}
              </button>
            )}

          </div>
        </div>

        {/* Visualização do Recibo à Direita */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-300 p-8 sm:p-14 min-h-[620px] flex flex-col justify-between text-zinc-950 font-serif relative overflow-hidden print:p-0 print:border-none print:shadow-none print:min-h-0">
            
            {/* Cabeçalho do Recibo */}
            <div>
              <div className="flex items-center justify-between pb-8 border-b border-zinc-300">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-normal font-serif">
                      Recibo
                    </h1>
                    {reciboSalvo?.numero_recibo && (
                      <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-zinc-800 font-sans text-xs font-black tracking-wider uppercase">
                        Nº {reciboSalvo.numero_recibo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                    R${valorTotalCalculado.toFixed(2).replace('.', ',')}
                  </div>
                  {qtdDiarias > 1 && (
                    <div className="text-xs font-sans text-zinc-500 font-semibold">
                      {qtdDiarias} diárias (R$ {valorUnit.toFixed(2).replace('.', ',')}/dia)
                    </div>
                  )}
                </div>
              </div>

              {/* Corpo Principal do Recibo */}
              <div className="mt-8 space-y-6 text-justify text-base sm:text-lg leading-relaxed font-serif text-zinc-900">
                {dadosRecibo.pago ? (
                  <>
                    <p className="indent-8">
                      Recebi da <strong className="font-extrabold tracking-wide">DISTRIBUIDORA IRMÃOS BARREIRO DE BEBIDAS LTDA</strong> a importância de <strong>R${valorTotalCalculado.toFixed(2).replace('.', ',')} ({valorExtenso})</strong> referente {dadosRecibo.referente || 'pagamento de diária trabalhada e almoço'}.
                    </p>

                    <p className="indent-8">
                      Onde firmo o presente dando plena, geral e irrevogável quitação do valor recebido, para os devidos fins e efeitos legais.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="indent-8">
                      Documento de comprovação de serviços prestados para a <strong className="font-extrabold tracking-wide">DISTRIBUIDORA IRMÃOS BARREIRO DE BEBIDAS LTDA</strong> referente {dadosRecibo.referente || 'diárias trabalhadas e almoço'}, no valor total a ser pago de <strong>R${valorTotalCalculado.toFixed(2).replace('.', ',')} ({valorExtenso})</strong>.
                    </p>

                    <p className="indent-8">
                      O presente documento atesta o registro das diárias e autoriza a liquidação do pagamento correspondente.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Local, Data e Assinatura */}
            <div className="mt-14 space-y-12">
              <div className="text-center text-base sm:text-lg font-serif">
                {dataFormatada}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-72 sm:w-80 border-t border-zinc-900 mb-2"></div>
                <div className="font-bold text-base sm:text-lg font-sans uppercase tracking-tight">
                  {dadosRecibo.nome || 'Daniel Felipe da Silva'}
                </div>
                {dadosRecibo.cpf && (
                  <div className="text-xs sm:text-sm font-sans text-zinc-700">
                    CPF: {dadosRecibo.cpf}
                  </div>
                )}
              </div>

              {/* Bloco Inferior de Identificação / PIX */}
              <div className="pt-6 border-t border-zinc-200/80 font-sans text-sm text-zinc-800 space-y-0.5">
                {dadosRecibo.pix && (
                  <div className="font-bold">
                    PIX: {dadosRecibo.pix}
                  </div>
                )}
                <div className="font-medium">
                  {dadosRecibo.nome || 'Daniel Felipe da Silva'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
