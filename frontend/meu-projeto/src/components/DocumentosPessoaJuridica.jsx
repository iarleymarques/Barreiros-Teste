import React, { useEffect, useState } from 'react';
import { Eye, FileText, FileUp, Loader2, Trash2 } from 'lucide-react';
import { baixarDocumentoPessoaJuridicaApi, enviarDocumentoPessoaJuridicaApi, getDocumentosPessoaJuridicaApi, removerDocumentoPessoaJuridicaApi } from '../services/api';

const POSICOES = Array.from({ length: 8 }, (_, indice) => indice + 1);

export default function DocumentosPessoaJuridica({ cadastroId }) {
  const [documentos, setDocumentos] = useState([]);
  const [processando, setProcessando] = useState(0);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!cadastroId) return;
    getDocumentosPessoaJuridicaApi(cadastroId).then(setDocumentos).catch((e) => setErro(e.message));
  }, [cadastroId]);

  async function enviar(posicao, arquivo) {
    if (!arquivo || !cadastroId) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(arquivo.type) || arquivo.size > 10 * 1024 * 1024) {
      setErro('Envie PDF, JPG ou PNG com no máximo 10 MB.'); return;
    }
    setErro(''); setProcessando(posicao);
    try {
      const atualizado = await enviarDocumentoPessoaJuridicaApi(cadastroId, posicao, arquivo);
      setDocumentos((atuais) => [...atuais.filter((item) => item.posicao !== posicao), atualizado]);
    } catch (e) { setErro(e.message); } finally { setProcessando(0); }
  }

  async function abrir(documento) {
    try {
      const arquivo = await baixarDocumentoPessoaJuridicaApi(cadastroId, documento.id);
      const url = URL.createObjectURL(arquivo); window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { setErro(e.message); }
  }

  async function remover(documento) {
    setProcessando(documento.posicao);
    try { await removerDocumentoPessoaJuridicaApi(cadastroId, documento.id); setDocumentos((atual) => atual.filter((item) => item.id !== documento.id)); }
    catch (e) { setErro(e.message); } finally { setProcessando(0); }
  }

  return <section className="no-print bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-xl space-y-5 max-w-4xl mx-auto">
    <div className="flex items-start gap-3 border-b border-zinc-200 pb-4"><div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><FileUp className="w-5 h-5" /></div><div><h3 className="text-base sm:text-lg font-black text-zinc-900">Documentos da Pessoa Jurídica</h3><p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Anexe até 8 documentos em PDF, JPG ou PNG.</p></div></div>
    {erro && <p className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">{erro}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{POSICOES.map((posicao) => { const documento = documentos.find((item) => item.posicao === posicao); const ocupado = processando === posicao; return <div key={posicao} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 flex flex-col gap-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-500 flex items-center justify-center"><FileText className="w-4 h-4" /></div><div><h4 className="text-sm font-black text-zinc-900">DOCUMENTO {String(posicao).padStart(2, '0')}</h4><p className="text-xs text-zinc-500">{documento?.nome_arquivo || 'PDF, JPG ou PNG'}</p></div></div>{documento ? <div className="flex gap-2"><button onClick={() => abrir(documento)} className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-zinc-200"><Eye className="w-3.5 h-3.5 inline mr-1" />Visualizar</button><label className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 text-white cursor-pointer">Substituir<input className="hidden" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => enviar(posicao, e.target.files?.[0])} /></label><button disabled={ocupado} onClick={() => remover(documento)} className="px-3 py-2 text-xs text-zinc-500"><Trash2 className="w-3.5 h-3.5 inline mr-1" />Remover</button></div> : <label className="mt-auto w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white cursor-pointer">{ocupado ? <Loader2 className="w-4 h-4 inline animate-spin mr-1" /> : <FileUp className="w-4 h-4 inline mr-1" />}Anexar documento<input className="hidden" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => enviar(posicao, e.target.files?.[0])} /></label>}</div>; })}</div>
  </section>;
}
