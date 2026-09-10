import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, FileText, FileUp, Loader2, Trash2 } from 'lucide-react';
import {
  baixarDocumentoColaboradorApi,
  enviarDocumentoColaboradorApi,
  getDocumentosColaboradorApi,
  removerDocumentoColaboradorApi,
} from '../services/api';

const ESPACOS_DOCUMENTOS = [
  { id: 'ficha_assinada', titulo: 'CPF', descricao: 'Envie o documento de CPF digitalizado.' },
  { id: 'identidade', titulo: 'Documento de identidade', descricao: 'RG ou documento oficial com foto.' },
  { id: 'comprovante_residencia', titulo: 'Comprovante de residencia', descricao: 'Comprovante atualizado do endereco informado.' },
  { id: 'comprovante_bancario', titulo: 'Outro documento', descricao: 'Envie outro documento complementar.' },
];

const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export default function DocumentosPessoaFisica({ colaboradorId }) {
  const [documentos, setDocumentos] = useState([]);
  const [carregando, setCarregando] = useState(Boolean(colaboradorId));
  const [enviando, setEnviando] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  async function carregarDocumentos() {
    if (!colaboradorId) return;
    setCarregando(true);
    try {
      setDocumentos(await getDocumentosColaboradorApi(colaboradorId));
    } catch (erro) {
      setMensagemErro(erro.message || 'Nao foi possivel carregar os documentos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDocumentos();
  }, [colaboradorId]);

  async function enviarArquivo(tipoDocumento, arquivo) {
    if (!arquivo || !colaboradorId) return;
    setMensagemErro('');
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(arquivo.type)) {
      setMensagemErro('Envie somente arquivos PDF, JPG ou PNG.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setMensagemErro('O arquivo deve ter no maximo 10 MB.');
      return;
    }

    setEnviando(tipoDocumento);
    try {
      const documentoAtualizado = await enviarDocumentoColaboradorApi(colaboradorId, tipoDocumento, arquivo);
      setDocumentos((atuais) => [
        ...atuais.filter((item) => item.tipo_documento !== tipoDocumento),
        documentoAtualizado,
      ]);
    } catch (erro) {
      setMensagemErro(erro.message || 'Nao foi possivel anexar o documento.');
    } finally {
      setEnviando('');
    }
  }

  async function abrirDocumento(documento) {
    setMensagemErro('');
    try {
      const arquivo = await baixarDocumentoColaboradorApi(colaboradorId, documento.id);
      const url = URL.createObjectURL(arquivo);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (erro) {
      setMensagemErro(erro.message || 'Nao foi possivel abrir o documento.');
    }
  }

  async function removerDocumento(documento) {
    if (!window.confirm(`Remover o arquivo "${documento.nome_arquivo}" deste espaco?`)) return;
    setMensagemErro('');
    setEnviando(documento.tipo_documento);
    try {
      await removerDocumentoColaboradorApi(colaboradorId, documento.id);
      setDocumentos((atuais) => atuais.filter((item) => item.id !== documento.id));
    } catch (erro) {
      setMensagemErro(erro.message || 'Nao foi possivel remover o documento.');
    } finally {
      setEnviando('');
    }
  }

  return (
    <section className="no-print bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/80 shadow-xl space-y-5 max-w-4xl mx-auto">
      <div className="flex items-start gap-3 border-b border-zinc-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <FileUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-zinc-900">Documentos da Pessoa Fisica</h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">Preencha os espacos abaixo com os documentos impressos e digitalizados deste cadastro.</p>
        </div>
      </div>

      {!colaboradorId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Salve a ficha com o backend conectado para liberar os anexos.
        </div>
      )}

      {mensagemErro && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {mensagemErro}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ESPACOS_DOCUMENTOS.map((espaco) => {
          const documento = documentos.find((item) => item.tipo_documento === espaco.id);
          const processando = enviando === espaco.id;
          return (
            <div key={espaco.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${documento ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-200 text-zinc-500'}`}>
                  {documento ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-zinc-900">{espaco.titulo}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{documento ? documento.nome_arquivo : espaco.descricao}</p>
                </div>
              </div>

              {documento ? (
                <div className="flex flex-wrap gap-2 mt-auto">
                  <button type="button" onClick={() => abrirDocumento(documento)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-zinc-200 text-zinc-700 hover:text-red-600 hover:border-red-200 transition cursor-pointer">
                    <Eye className="w-3.5 h-3.5" /> Visualizar
                  </button>
                  <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition cursor-pointer ${processando || !colaboradorId ? 'opacity-50 pointer-events-none' : ''}`}>
                    {processando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                    Substituir
                    <input type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" disabled={!colaboradorId || processando} onChange={(event) => enviarArquivo(espaco.id, event.target.files?.[0])} />
                  </label>
                  <button type="button" onClick={() => removerDocumento(documento)} disabled={processando} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
              ) : (
                <label className={`mt-auto inline-flex w-fit items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm transition cursor-pointer ${processando || !colaboradorId ? 'opacity-50 pointer-events-none' : ''}`}>
                  {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                  {processando ? 'Anexando...' : 'Anexar documento'}
                  <input type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" disabled={!colaboradorId || processando} onChange={(event) => enviarArquivo(espaco.id, event.target.files?.[0])} />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {carregando && <p className="text-xs text-zinc-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando documentos anexados...</p>}
      <p className="text-[11px] text-zinc-400">Formatos aceitos: PDF, JPG e PNG. Tamanho maximo por arquivo: 10 MB.</p>
    </section>
  );
}
