import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';
import { Download, Printer, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Logo from '../Logo';
import { PROCEDIMENTO_TEXTO_PAGINA_2 } from './ptData';

/**
 * Componente que renderiza o layout idêntico aos PDFs técnicos oficiais
 * da Distribuidora Irmãos Barreiro para as 5 opções de Permissão de Trabalho (PTE).
 * Gera o arquivo PDF direto no navegador (A4 - 2 páginas) sem cortes laterais.
 */
export default function DocumentoPTImpressao({ pt, config, onVoltar }) {
  const pagina1Ref = useRef(null);
  const pagina2Ref = useRef(null);
  const [baixando, setBaixando] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState(false);

  if (!pt || !config) return null;

  const dados = pt.dados || {};
  const numeroPt = pt.numero_pt || 'PTE-BARREIRO-001';

  // Helper para renderizar checkbox marcado ou vazio
  const renderCheck = (marcado) => (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-zinc-700 text-[10px] font-black leading-none mr-1.5 shrink-0 bg-white">
      {marcado ? 'X' : ''}
    </span>
  );

  // Captura o elemento DOM com dimensões exatas A4 (sem deslocamento lateral e sem corte)
  const capturarImagemElemento = async (elemento) => {
    if (!elemento) return null;

    // Largura padrão fixa A4 em 96 DPI
    const targetWidth = 794;
    const targetHeight = elemento.offsetHeight || 1123;

    try {
      // Tentativa principal com toJpeg forçando margin zero absoluto
      return await toJpeg(elemento, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: targetWidth,
        height: targetHeight,
        style: {
          margin: '0',
          marginLeft: '0',
          marginRight: '0',
          marginTop: '0',
          marginBottom: '0',
          boxShadow: 'none',
          transform: 'none',
          width: `${targetWidth}px`,
          minWidth: `${targetWidth}px`,
          maxWidth: `${targetWidth}px`,
        },
      });
    } catch (err) {
      console.warn('Fallback para html2canvas:', err);
      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector(`[data-pt-page="${elemento.getAttribute('data-pt-page')}"]`);
          if (el) {
            el.style.margin = '0px';
            el.style.boxShadow = 'none';
            el.style.width = `${targetWidth}px`;
          }
        },
      });
      return canvas.toDataURL('image/jpeg', 0.98);
    }
  };

  // GERAÇÃO DO PDF EM A4 PERFEITO COM MARGENS DE SEGURANÇA (SEM CORTES)
  const handleBaixarPdf = async () => {
    if (!pagina1Ref.current || !pagina2Ref.current) return;
    setBaixando(true);
    setSucessoMsg(false);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => setTimeout(r, 200));

      // Captura as duas páginas
      const imgPagina1 = await capturarImagemElemento(pagina1Ref.current);
      const imgPagina2 = await capturarImagemElemento(pagina2Ref.current);

      if (!imgPagina1 || !imgPagina2) {
        throw new Error('Falha ao renderizar as páginas da PT');
      }

      // Cria PDF A4
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // A4 tem 210 x 297 mm
      // Margem segura de 4mm para garantir que o conteúdo fique 100% visível e centralizado
      const margemX = 4;
      const margemY = 4;
      const larguraUtil = 210 - (margemX * 2); // 202 mm
      const alturaUtil = 297 - (margemY * 2);  // 289 mm

      // Página 1 (Frente)
      pdf.addImage(imgPagina1, 'JPEG', margemX, margemY, larguraUtil, alturaUtil, undefined, 'FAST');

      // Página 2 (Verso)
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgPagina2, 'JPEG', margemX, margemY, larguraUtil, alturaUtil, undefined, 'FAST');

      // Salva arquivo com nome limpo
      const cleanNumero = (numeroPt || 'PT').replace(/[^a-zA-Z0-9_-]/g, '_');
      const nomeArquivo = `${cleanNumero}_Distribuidora_Barreiro.pdf`;

      pdf.save(nomeArquivo);

      setSucessoMsg(true);
      setTimeout(() => setSucessoMsg(false), 4000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF direto. Tentando abrir impressão do navegador...');
      window.print();
    } finally {
      setBaixando(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ESTILOS DE IMPRESSÃO LIMPOS (A4) */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .folha-a4 {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
          }
          .folha-a4-quebra {
            page-break-before: always !important;
            break-before: page !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* BARRA DE AÇÕES SUPERIOR (OCULTA NA IMPRESSÃO) */}
      <div className="no-print bg-zinc-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onVoltar}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-bold transition cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às PTs</span>
          </button>
          <div>
            <span className="text-xs text-zinc-400">Permissão Gerada:</span>
            <p className="text-sm font-bold text-white font-mono">{numeroPt}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sucessoMsg && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
              <CheckCircle2 className="w-4 h-4" /> PDF baixado com sucesso!
            </span>
          )}

          {/* BOTÃO PRINCIPAL: BAIXAR PDF OFICIAL (A4 DIRETO) */}
          <button
            onClick={handleBaixarPdf}
            disabled={baixando}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black transition cursor-pointer flex items-center gap-2 shadow-lg shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {baixando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando PDF A4...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar PDF Oficial</span>
              </>
            )}
          </button>

          {/* BOTÃO SECUNDÁRIO: IMPRIMIR */}
          <button
            onClick={handleImprimir}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-bold transition cursor-pointer flex items-center gap-2 border border-zinc-700"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* FOLHA OFICIAL A4 — PÁGINA 1 (FRENTE)                                */}
      {/* =================================================================== */}
      <div className="w-full flex justify-center overflow-x-auto py-2">
        <div
          ref={pagina1Ref}
          data-pt-page="1"
          className="folha-a4 bg-white text-zinc-900 p-6 shadow-2xl border border-zinc-300 font-sans text-[11px] leading-tight shrink-0 flex flex-col justify-between overflow-hidden"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            minHeight: '1123px',
            boxSizing: 'border-box',
            margin: '0',
          }}
        >
          <div>
            {/* CABEÇALHO COM LOGO E TARJA COLORIDA */}
            <div className="flex items-stretch border-2 border-black mb-1">
              {/* Logo e Nome da Empresa */}
              <div className="w-[180px] p-2 flex flex-col items-center justify-center border-r-2 border-black bg-white shrink-0">
                <div className="scale-75 origin-center">
                  <Logo />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider text-center text-zinc-800 mt-1">
                  Distribuidora Irmãos Barreiro
                </span>
              </div>

              {/* Faixa Colorida com Título Oficial */}
              <div
                className="flex-1 flex items-center justify-center p-3 text-center"
                style={{ backgroundColor: config.hexCor || '#dc2626' }}
              >
                <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider leading-snug drop-shadow-sm">
                  {config.label}
                </h1>
              </div>
            </div>

            {/* SUBTÍTULO OBRIGATÓRIO */}
            <div className="border-x-2 border-b-2 border-black bg-zinc-100 py-1 px-2 text-center mb-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-800">
                {config.subtitulo}
              </p>
            </div>

            {/* DADOS GERAIS DO TRABALHO (TABELA SUPERIOR) */}
            <table className="w-full border-collapse border-2 border-black mb-1">
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold w-[70%]">
                    <span className="text-zinc-600 font-semibold">Área: </span>
                    <span className="text-zinc-950 font-bold">{dados.area || 'Operacional / CD Principal'}</span>
                  </td>
                  <td className="border border-black p-1 font-bold w-[30%] bg-zinc-50">
                    <span className="text-zinc-600 font-semibold">Nº da PTE: </span>
                    <span className="text-zinc-950 font-mono font-black">{numeroPt}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">
                    <span className="text-zinc-600 font-semibold">Solicitante do Serviço: </span>
                    <span className="text-zinc-950">{dados.solicitante || dados.responsavel || '—'}</span>
                  </td>
                  <td className="border border-black p-1 font-bold bg-zinc-50">
                    <span className="text-zinc-600 font-semibold">Nº da PTR: </span>
                    <span className="text-zinc-950 font-mono">{dados.numero_ptr || 'PTR-' + (numeroPt.split('-')[2] || '01')}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">
                    <span className="text-zinc-600 font-semibold">Local do Serviço: </span>
                    <span className="text-zinc-950">{dados.local_trabalho || pt.local_trabalho || '—'}</span>
                  </td>
                  <td className="border border-black p-1 font-bold bg-zinc-50">
                    <span className="text-zinc-600 font-semibold">Nº da APR: </span>
                    <span className="text-zinc-950 font-mono">{dados.numero_apr || 'APR-00' + (numeroPt.slice(-3) || '1')}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1 font-bold">
                    <span className="text-zinc-600 font-semibold">Descrição do Trabalho: </span>
                    <span className="text-zinc-950">{dados.descricao_trabalho || dados.descricao_servico || 'Atividades de manutenção e intervenção autorizada.'}</span>
                  </td>
                  <td className="border border-black p-1 font-bold bg-zinc-50">
                    <span className="text-zinc-600 font-semibold">Nº da OS: </span>
                    <span className="text-zinc-950 font-mono">{dados.numero_os || 'OS-' + (new Date().getFullYear())}</span>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-black p-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div>
                        <span className="font-semibold text-zinc-600">Data da emissão: </span>
                        <span className="font-bold text-zinc-950">{dados.data_emissao || dados.data_inicio || '—'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-600">Data do término: </span>
                        <span className="font-bold text-zinc-950">{dados.data_termino || dados.data_emissao || '—'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-600">Horário da emissão: </span>
                        <span className="font-bold text-zinc-950">{dados.hora_inicio || dados.horario_emissao || '08:00'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-600">Horário do término: </span>
                        <span className="font-bold text-zinc-950">{dados.hora_termino || dados.horario_termino || '17:00'}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* DETALHES ESPECÍFICOS DO TIPO DE TRABALHO */}
            {config.id === 'ELETRICIDADE' && (
              <div className="border-2 border-black p-1.5 mb-1 bg-yellow-50/50">
                <div className="font-bold text-[10px] uppercase mb-1 text-center bg-yellow-100 py-0.5 border border-black">
                  Dispositivos de bloqueios / Tensão
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-1">
                  <div><span className="font-semibold">Nº da etiqueta de bloqueio:</span> {dados.etiqueta_bloqueio || 'EB-01'}</div>
                  <div><span className="font-semibold">Nº da etiqueta de identificação:</span> {dados.etiqueta_identificacao || 'EI-01'}</div>
                  <div><span className="font-semibold">Nº do cadeado:</span> {dados.numero_cadeado || 'CAD-01'}</div>
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold justify-center pt-1 border-t border-black/30">
                  <span>{renderCheck(dados.tensao_nivel === 'BAIXA')} BAIXA TENSÃO</span>
                  <span>{renderCheck(dados.tensao_nivel === 'ALTA')} ALTA TENSÃO</span>
                  <span>{renderCheck(dados.estado_rede === 'ENERGIZADA')} REDES ENERGIZADA</span>
                  <span>{renderCheck(dados.estado_rede !== 'ENERGIZADA')} DESENERGIZADA</span>
                </div>
              </div>
            )}

            {config.id === 'TRABALHO_QUENTE' && (
              <div className="border-2 border-black p-1.5 mb-1 bg-orange-50/50">
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-1">
                  <div>
                    <span className="font-bold">Natureza do Trabalho: </span>
                    <span className="inline-flex gap-2">
                      <span>{renderCheck(dados.natureza === 'Solda')} Solda</span>
                      <span>{renderCheck(dados.natureza === 'Maçarico')} Maçarico</span>
                      <span>{renderCheck(dados.natureza === 'Lixamento')} Lixamento</span>
                      <span>{renderCheck(dados.natureza === 'Aquecimento')} Aquecimento</span>
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">Executante: </span>
                    <span>{renderCheck(dados.tipo_executante !== 'Terceiro')} Próprio</span>
                    <span className="ml-2">{renderCheck(dados.tipo_executante === 'Terceiro')} Terceirizado: {dados.empresa_terceira || '—'}</span>
                  </div>
                </div>
                <div className="text-[10px] pt-1 border-t border-black/30 flex justify-between items-center">
                  <span><b>Necessita de Observador de Incêndio?</b> {dados.precisa_observador === 'Não' ? '[X] NÃO' : '[X] SIM'}</span>
                  <span><b>Observador de Incêndio:</b> {dados.nome_observador || dados.responsavel || 'Designado pelo SESMT'}</span>
                  <span><b>Período pós-fogo (30 min):</b> [X] Cumprido</span>
                </div>
              </div>
            )}

            {config.id === 'ESPACO_CONFINADO' && (
              <div className="border-2 border-black p-1.5 mb-1 bg-emerald-50/50 text-[10px]">
                <div className="font-bold uppercase text-center bg-emerald-100 py-0.5 border border-black mb-1">
                  Procedimentos que Devem ser Completados Antes da Entrada - Medição Atmosférica T1
                </div>
                <div className="grid grid-cols-4 gap-2 text-center border border-black/40 p-1 bg-white">
                  <div><b>Oxigênio (O₂):</b> {dados.medicao_o2 || '20.9 %'}</div>
                  <div><b>Inflamáveis (% LIE):</b> {dados.medicao_lie || '0.0 %'}</div>
                  <div><b>Monóxido de Carbono (CO):</b> {dados.medicao_co || '0 ppm'}</div>
                  <div><b>Sulfeto de Hidrogênio (H₂S):</b> {dados.medicao_h2s || '0 ppm'}</div>
                </div>
                <div className="flex justify-between items-center mt-1 text-[9px]">
                  <span><b>Equipamento Medidor:</b> {dados.medidor_modelo || 'Multigás Certificado INMETRO'}</span>
                  <span><b>Vigia Designado:</b> {dados.vigia || 'Colaborador Qualificado'}</span>
                  <span><b>Supervisor de Entrada:</b> {dados.supervisor_entrada || dados.responsavel || 'Autorizado'}</span>
                </div>
              </div>
            )}

            {/* EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL - EPI */}
            <div className="border-2 border-black mb-1">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                Equipamentos de Proteção Individual - EPI
              </div>
              <div className="p-1.5 grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-[9.5px]">
                {config.epis.map((epi, idx) => {
                  const marcado = dados.epis_selecionados ? dados.epis_selecionados.includes(epi) : true;
                  return (
                    <div key={idx} className="flex items-center">
                      {renderCheck(marcado)}
                      <span className="truncate">{epi}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-black/50 p-1 bg-zinc-50 text-[9px]">
                <span className="font-bold">Outros EPIs Necessários: </span>
                <span>{dados.outros_epis || 'Conforme análise da APR e FISPQ dos materiais utilizados.'}</span>
              </div>
            </div>

            {/* EQUIPAMENTOS DE PROTEÇÃO COLETIVA - EPC */}
            <div className="border-2 border-black mb-1">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                Equipamentos de Proteção Coletiva - EPC
              </div>
              <div className="p-1.5 grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-[9.5px]">
                {config.epcs.map((epc, idx) => {
                  const marcado = dados.epcs_selecionados ? dados.epcs_selecionados.includes(epc) : true;
                  return (
                    <div key={idx} className="flex items-center">
                      {renderCheck(marcado)}
                      <span className="truncate">{epc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MEDIDAS DE CONTROLE NECESSÁRIAS - ITENS A SEREM OBSERVADOS (TABELA S / N / NA) */}
            <div className="border-2 border-black mb-1">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                MEDIDAS DE CONTROLE NECESSÁRIAS
              </div>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black text-center font-bold">
                    <th className="p-1 text-left border-r border-black w-[85%]">Itens a Serem Observados</th>
                    <th className="p-1 border-r border-black w-[5%]">S</th>
                    <th className="p-1 border-r border-black w-[5%]">N</th>
                    <th className="p-1 w-[5%]">NA</th>
                  </tr>
                </thead>
                <tbody>
                  {config.itensMedidasControle.map((item, idx) => {
                    const resposta = dados.checklist?.[idx] || 'S';
                    return (
                      <tr key={idx} className="border-b border-zinc-400 hover:bg-zinc-50">
                        <td className="p-0.5 px-1 border-r border-black text-zinc-900 leading-tight">
                          {item}
                        </td>
                        <td className="p-0.5 text-center border-r border-black font-black text-[10px]">
                          {resposta === 'S' ? 'X' : ''}
                        </td>
                        <td className="p-0.5 text-center border-r border-black font-black text-[10px]">
                          {resposta === 'N' ? 'X' : ''}
                        </td>
                        <td className="p-0.5 text-center font-black text-[10px]">
                          {resposta === 'NA' ? 'X' : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* VALIDAÇÃO / REVALIDAÇÃO DA PTE (ASSINATURAS) */}
            <div className="border-2 border-black mb-1">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                Validação / Revalidação da PTE
              </div>
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black text-center font-bold">
                    <th className="p-1 text-left border-r border-black w-[40%]">Função / Responsável</th>
                    <th className="p-1 border-r border-black w-[20%]">Nome / Matrícula</th>
                    <th className="p-1 border-r border-black w-[15%]">Data</th>
                    <th className="p-1 w-[25%]">Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-400">
                    <td className="p-1 border-r border-black font-bold">Responsável emissão da PTE:</td>
                    <td className="p-1 border-r border-black">{dados.responsavel_emissao || dados.responsavel || 'Enc. Manutenção'}</td>
                    <td className="p-1 border-r border-black text-center">{dados.data_emissao || '—'}</td>
                    <td className="p-1 text-center font-serif italic text-zinc-500">[Assinado Digitalmente]</td>
                  </tr>
                  <tr className="border-b border-zinc-400">
                    <td className="p-1 border-r border-black font-bold">Responsável pelo serviço:</td>
                    <td className="p-1 border-r border-black">{dados.responsavel_servico || dados.executor || 'Técnico Especialista'}</td>
                    <td className="p-1 border-r border-black text-center">{dados.data_emissao || '—'}</td>
                    <td className="p-1 text-center font-serif italic text-zinc-500">[Assinado Digitalmente]</td>
                  </tr>
                  <tr>
                    <td className="p-1 border-r border-black font-bold">Resp. Segurança do Trabalho / Pessoa Autorizada:</td>
                    <td className="p-1 border-r border-black">{dados.seguranca_trabalho || 'SESMT Distribuidora Barreiro'}</td>
                    <td className="p-1 border-r border-black text-center">{dados.data_emissao || '—'}</td>
                    <td className="p-1 text-center font-serif italic text-zinc-500">[Assinado Digitalmente]</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* MEDIDAS PREVENTIVAS ADICIONAIS */}
            <div className="border-2 border-black p-1.5 mb-1 bg-zinc-50 text-[9.5px]">
              <span className="font-bold">Medidas Preventivas Adicionais: </span>
              <span>
                {dados.medidas_adicionais ||
                  dados.observacoes ||
                  'Manter constante monitoramento da área, comunicação via rádio atenta e paralisação imediata em caso de anormalidade.'}
              </span>
            </div>

            {/* ALERTA DE EMERGÊNCIA E RODAPÉ */}
            <div className="border-2 border-black bg-zinc-900 text-white p-1 text-center mb-1">
              <p className="font-black text-[10px] uppercase tracking-wider text-amber-300">
                ATENÇÃO! ACIONAR A BRIGADA DE EMERGÊNCIA/SESMT EM CASO DE ACIDENTE
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8.5px] text-zinc-600 px-1 pt-1 border-t border-zinc-300">
            <span className="font-bold">{config.vias}</span>
            <span className="italic">Classified - Internal use</span>
            <span className="font-bold">{config.revisao}</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* FOLHA OFICIAL A4 — PÁGINA 2 (VERSO NORMATIVO E DECLARAÇÃO)        */}
      {/* =================================================================== */}
      <div className="w-full flex justify-center overflow-x-auto py-2">
        <div
          ref={pagina2Ref}
          data-pt-page="2"
          className="folha-a4 folha-a4-quebra bg-white text-zinc-900 p-6 shadow-2xl border border-zinc-300 font-sans text-[11px] leading-tight shrink-0 flex flex-col justify-between overflow-hidden"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            minHeight: '1123px',
            boxSizing: 'border-box',
            margin: '0',
          }}
        >
          <div>
            {/* PROCEDIMENTO NORMATIVO */}
            <div className="border-2 border-black mb-2">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-1 border-b border-black">
                PROCEDIMENTO
              </div>
              <div className="p-2 space-y-1.5 text-[9px] text-zinc-800 text-justify leading-relaxed">
                {PROCEDIMENTO_TEXTO_PAGINA_2.map((paragrafo, idx) => (
                  <p key={idx}>{paragrafo}</p>
                ))}
              </div>
            </div>

            {/* MEDIDAS DE CONTROLE A SEREM ADOTADAS */}
            <div className="border-2 border-black mb-2">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                MEDIDAS DE CONTROLE A SEREM ADOTADAS
              </div>
              <div className="p-2 text-[9px] text-zinc-800 leading-relaxed text-justify">
                Verifique se as medidas de controle deste documento foram adotadas de acordo com a classificação das fontes potenciais de riscos indicadas. 
                <b> Obs. Se for identificado como "NÃO" (Não Conforme), qualquer um dos itens relacionados nesta PTE, o trabalho NÃO poderá ser realizado enquanto não forem estabelecidas as medidas preventivas para evitar a ocorrência de qualquer tipo de incidente ou acidente.</b>
              </div>
            </div>

            {/* BLOCO ATENÇÃO LOCKOUT / ISOLAMENTO */}
            <div className="border-2 border-black mb-2 bg-zinc-50">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                ATENÇÃO — BLOQUEIO E ETIQUETAGEM (LOCKOUT / TAGOUT)
              </div>
              <div className="p-2 text-[8.5px] text-zinc-800 space-y-1 text-justify">
                <p>Se a pessoa que instalou o bloqueio (lockout) em um dispositivo de isolamento do sistema precisar deixar a unidade antes que o equipamento seja reestabelecido com segurança e não seja dispensado durante o próximo período de trabalho, deve-se anexar uma etiqueta informando "bloqueado" junto com o cadeado. Procedimentos especiais devem ser seguidos para remover o cadeado quando o responsável estiver fora da unidade:</p>
                <p><b>A)</b> O supervisor do empregado deve se certificar de que ele realmente esteja fora da unidade;</p>
                <p><b>B)</b> Tentar contatar o responsável pelo cadeado, confirmar que é seguro remove-lo e colocar o equipamento em operação e informá-lo que seu cadeado será removido. Se essa tentativa for frustrada, o responsável pelo cadeado deve ser informado que seu cadeado foi removido assim que retornar à unidade, antes de começar a trabalhar;</p>
                <p><b>C)</b> Um colaborador especialmente designado que conheça o equipamento (sua operação, seus perigos e os procedimentos da unidade para controle de energia perigosa) é responsável por realizar uma avaliação completa do equipamento e certificar-se que nenhum colaborador pode vir a ser prejudicado com a retirada do cadeado e o funcionamento do sistema;</p>
                <p><b>D)</b> Cabe ao colaborador especialmente designado que conheça o equipamento, proceder a retirada do cadeado/etiqueta, conforme acima descrito.</p>
              </div>
            </div>

            {/* DECLARAÇÃO — CIÊNCIA DOS TRABALHADORES AUTORIZADOS */}
            <div className="border-2 border-black mb-2">
              <div className="bg-zinc-200 font-black text-[10px] text-center uppercase py-0.5 border-b border-black">
                DECLARAÇÃO - CIÊNCIA
              </div>
              <div className="p-1.5 text-[8.5px] text-zinc-700 leading-snug border-b border-black text-justify">
                <b>Trabalhadores Autorizados: </b>
                Declaro que fui devidamente informado sobre os riscos a que estarei exposto durante a realização dos serviços referente a essa PT, comprometo-me a agir preventivamente, usando os EPIs recomendados e tomando todas as providências que visem evitar acidentes, impacto ambiental e/ou perda de produção, conforme assinado por mim abaixo.
              </div>

              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-black text-center font-bold">
                    <th className="p-1 border-r border-black w-[40%] text-left">NOME</th>
                    <th className="p-1 border-r border-black w-[25%]">EMPRESA</th>
                    <th className="p-1 border-r border-black w-[15%]">MATRÍCULA</th>
                    <th className="p-1 w-[20%]">ASSINATURA</th>
                  </tr>
                </thead>
                <tbody>
                  {(dados.trabalhadores && dados.trabalhadores.length > 0 ? dados.trabalhadores : [
                    { nome: dados.solicitante || dados.executor || 'Executor Principal', empresa: 'Distribuidora Irmãos Barreiro', matricula: '001' },
                    { nome: dados.responsavel_servico || 'Auxiliar Técnico', empresa: 'Distribuidora Irmãos Barreiro', matricula: '002' },
                    { nome: '', empresa: '', matricula: '' },
                    { nome: '', empresa: '', matricula: '' },
                  ]).map((trab, idx) => (
                    <tr key={idx} className="border-b border-zinc-300">
                      <td className="p-1 border-r border-black font-semibold">{trab.nome || '—'}</td>
                      <td className="p-1 border-r border-black text-center">{trab.empresa || '—'}</td>
                      <td className="p-1 border-r border-black text-center">{trab.matricula || '—'}</td>
                      <td className="p-1 text-center font-serif italic text-zinc-500 text-[8px]">{trab.nome ? '[Assinado]' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RODAPÉ PÁGINA 2 */}
          <div className="flex justify-between items-center text-[8.5px] text-zinc-600 px-1 pt-1 border-t border-zinc-300">
            <span className="font-bold">Página 2 de 2</span>
            <span className="italic">Classified - Internal use</span>
            <span className="font-bold">{config.revisao}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
