import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import FormularioColaborador from './FormularioColaborador';
import RelacaoDiaristas from './RelacaoDiaristas';
import CadastrarDiarista from './CadastrarDiarista';
import ReciboIndividual from './ReciboIndividual';
import RelatorioSolar from './RelatorioSolar';
import RegistroFuncionarios from './RegistroFuncionarios';
import PermissaoTrabalhos from './PermissaoTrabalhos';
import { getDiaristasApi, createDiaristaApi, toggleStatusPagoApi, deleteDiaristaApi, resetDiaristasApi } from '../services/api';
import { ArrowRight, Briefcase, FileText, LayoutGrid, LogOut, Receipt, ShieldAlert, Sun, Users } from 'lucide-react';

const moduleItems = [
  {
    num: '01',
    id: 'MOD-01',
    key: 'formulario',
    title: 'Cadastro do colaborador',
    desc: 'Admissão com dados pessoais, endereço, documentos e chave PIX, gerando a ficha oficial em PDF.',
    action: 'Emitir ficha cadastral',
  },
  {
    num: '02',
    id: 'MOD-02',
    key: 'relacao',
    title: 'Lançamento da diária',
    desc: 'Conferência diária de presença e pagamento, com cálculo automático por diária trabalhada.',
    action: 'Gerenciar diárias',
  },
  {
    num: '03',
    id: 'MOD-03',
    key: 'recibo',
    title: 'Emissão do recibo',
    desc: 'Recibo com validade jurídica gerado automaticamente após a confirmação do pagamento.',
    action: 'Emitir recibos',
  },
  {
    num: '04',
    id: 'MOD-04',
    key: 'solar',
    title: 'Relatório consolidado',
    desc: 'Fechamento Solar mensal com histórico acumulado de diárias e valores da operação.',
    action: 'Gerar relatórios',
  },
  {
    num: '05',
    id: 'MOD-05',
    key: 'registro_funcionarios',
    title: 'Registro de funcionários',
    desc: 'Histórico contínuo, data de entrada, diárias prestadas e valor total acumulado.',
    action: 'Consultar histórico',
  },
  {
    num: '06',
    id: 'MOD-06',
    key: 'pts',
    title: 'Permissões de trabalho (PTs)',
    desc: 'Emissão e gestão de PTs obrigatórias de segurança antes do início de operações de risco em campo.',
    action: 'Emitir PTs de segurança',
  },
];


export default function PortalColaborador({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('hub');
  const [selectedDiaristaForRecibo, setSelectedDiaristaForRecibo] = useState(null);
  const [diaristas, setDiaristas] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!['relacao', 'solar', 'recibo'].includes(activeModule)) return;
    async function carregarDiaristas() {
      try {
        const dados = await getDiaristasApi();
        if (Array.isArray(dados)) setDiaristas(dados.map(d => ({ id: d.id, nome: d.nome, valor: d.valor_diaria, diarias: d.quantidade_diarias, total: d.valor_total, pix: d.chave_pix, tipoPix: d.tipo_pix, motorista: d.profissao, profissao: d.profissao, data: d.data, observacoes: d.observacoes, pago: d.pago, createdAt: d.created_at })));
      } catch (err) { console.warn('Backend operando offline ou conectando...', err); }
    }
    carregarDiaristas();
  }, [activeModule]);

  const handleUpdateDiarista = updated => setDiaristas(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
  const handleExit = () => { onLogout?.(); navigate('/'); };
  const openModule = item => { if (item.key === 'recibo') setSelectedDiaristaForRecibo(null); setActiveModule(item.key); };
  async function handleAddDiarista(novo) {
    try {
      const salvo = await createDiaristaApi({ funcionario_id: novo.funcionario_id || null, nome: novo.nome, profissao: novo.motorista || novo.profissao || '', data: novo.data, valor_diaria: parseFloat(novo.valor) || 0, quantidade_diarias: parseInt(novo.diarias, 10) || 1, tipo_pix: novo.tipoPix || 'cpf', chave_pix: novo.pix || novo.chavePix || '', observacoes: novo.observacoes || '', pago: !!novo.pago });
      setDiaristas(prev => [{ id: salvo.id, nome: salvo.nome, valor: salvo.valor_diaria, diarias: salvo.quantidade_diarias, total: salvo.valor_total, pix: salvo.chave_pix, tipoPix: salvo.tipo_pix, motorista: salvo.profissao, profissao: salvo.profissao, data: salvo.data, observacoes: salvo.observacoes, pago: salvo.pago, createdAt: salvo.created_at }, ...prev]);
      if (salvo.data) setDataSelecionada(salvo.data);
    } catch (err) { console.error('Erro ao salvar diária no backend:', err); setDiaristas(prev => [novo, ...prev]); if (novo.data) setDataSelecionada(novo.data); }
    setActiveModule('relacao');
  }
  async function handleToggleStatus(id) { setDiaristas(prev => prev.map(d => d.id === id ? { ...d, pago: !d.pago } : d)); try { await toggleStatusPagoApi(id); } catch (err) { console.warn('Erro ao sincronizar status:', err); } }
  async function handleDeleteDiarista(id) { if (window.confirm('Deseja realmente remover este diarista da relação?')) { setDiaristas(prev => prev.filter(d => d.id !== id)); try { await deleteDiaristaApi(id); } catch (err) { console.warn('Erro ao remover no backend:', err); } } }
  function handleEmitirReciboDireto(diarista) { setSelectedDiaristaForRecibo(diarista); setActiveModule('recibo'); }
  async function handleResetDiaristas() { if (window.confirm('Deseja limpar toda a relação de diaristas?')) { setDiaristas([]); setDataSelecionada(new Date().toISOString().split('T')[0]); try { await resetDiaristasApi(); } catch (err) { console.warn('Erro ao resetar no backend:', err); } } }

  const content = activeModule === 'formulario' ? <FormularioColaborador userEmail={user?.email} onLogout={handleExit} onBack={() => setActiveModule('hub')} />
    : activeModule === 'relacao' ? <RelacaoDiaristas diaristas={diaristas} dataSelecionada={dataSelecionada} setDataSelecionada={setDataSelecionada} onNavigateCadastrar={() => setActiveModule('cadastrar_diarista')} onEmitirRecibo={handleEmitirReciboDireto} onToggleStatus={handleToggleStatus} onUpdateDiarista={handleUpdateDiarista} onDeleteDiarista={handleDeleteDiarista} onResetDiaristas={handleResetDiaristas} onBack={() => setActiveModule('hub')} />
    : activeModule === 'cadastrar_diarista' ? <CadastrarDiarista dataInicial={dataSelecionada} diaristasExistentes={diaristas} onBack={() => setActiveModule('relacao')} onSave={handleAddDiarista} />
    : activeModule === 'recibo' ? <ReciboIndividual diaristaInicial={selectedDiaristaForRecibo} diaristas={diaristas} onUpdateDiarista={handleUpdateDiarista} onBack={() => setActiveModule('hub')} />
    : activeModule === 'solar' ? <RelatorioSolar diaristas={diaristas} onBack={() => setActiveModule('hub')} />
    : activeModule === 'registro_funcionarios' ? <RegistroFuncionarios onBack={() => setActiveModule('hub')} />
    : activeModule === 'pts' ? <PermissaoTrabalhos onBack={() => setActiveModule('hub')} /> : null;

  return (
    <div className="min-h-screen font-[Manrope,sans-serif]" style={{ background: '#101214', color: '#f2f2ef' }}>
      <div className="grid min-h-screen lg:grid-cols-[258px_minmax(0,1fr)]">

        {/* ── SIDEBAR ── */}
        <aside className="hidden h-screen flex-col border-r border-[#1e2530] bg-[#0c0f14] lg:sticky lg:top-0 lg:flex">
          {/* Logo */}
          <button onClick={() => setActiveModule('hub')} className="h-16 shrink-0 flex items-center gap-3 px-5 text-left border-b border-[#1e2530] hover:bg-white/[0.02] transition">
            <Logo isDark className="h-8 shrink-0" />
            <div className="border-l border-white/10 pl-3">
              <b className="block text-xs font-black tracking-[0.18em] text-white uppercase">PORTAL RH</b>
              <small className="block text-[10px] text-[#4d6278] font-mono tracking-wider mt-0.5">IRMÃOS BARREIRO</small>
            </div>
          </button>

          {/* Sessão ativa */}
          <div className="mx-4 mt-4 border border-[#1e2a3a] p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="font-mono text-[9px] tracking-[0.14em] text-[#3a4f63] uppercase mb-1">SESSÃO ATIVA</p>
            <p className="text-[11px] font-medium text-[#8fa3be] truncate">{user?.email || 'colaborador@irmaosbarreiro.com.br'}</p>
          </div>

          {/* Nav */}
          <div className="px-4 mt-5 flex-1 overflow-y-auto">
            <p className="font-mono text-[9px] tracking-[0.16em] text-[#2d3f50] uppercase mb-2">ACESSO RÁPIDO</p>
            <nav className="space-y-px">
              {moduleItems.map(item => {
                const isActive = activeModule === item.key;
                const isPt = item.key === 'pts';
                return (
                  <button
                    key={item.key}
                    onClick={() => openModule(item)}
                    className={`flex w-full items-center gap-3 px-2 py-2.5 text-left text-xs font-medium transition border-l-2 ${
                      isActive
                        ? isPt
                          ? 'border-[#ffc72c] bg-[#ffc72c]/10 text-white'
                          : 'border-[#e3141a] bg-white/[0.04] text-white'
                        : 'border-transparent text-[#6b82a0] hover:bg-white/[0.03] hover:text-[#b7bac0]'
                    }`}
                  >
                    <span className={`font-mono text-[9px] font-bold shrink-0 w-12 ${isActive ? (isPt ? 'text-[#ffc72c]' : 'text-[#e3141a]') : (isPt ? 'text-[#ffc72c]/70' : 'text-[#3a4f63]')}`}>{item.id}</span>
                    <span className="truncate">{item.title}</span>
                    {isPt && <span className="ml-auto font-mono text-[8px] font-black text-[#ffc72c] border border-[#ffc72c]/50 px-1.5 py-0.5 shrink-0">OBRIG.</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sair */}
          <div className="h-14 shrink-0 flex items-center px-4 border-t border-[#1e2530] bg-[#0c0f14]">
            <button onClick={handleExit} className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-[#6b82a0] hover:text-white transition">
              <LogOut className="h-3.5 w-3.5 text-[#e3141a]" />
              <span>Sair da conta</span>
            </button>
          </div>
        </aside>

        {/* ── CONTEÚDO PRINCIPAL ── */}
        <div className="flex min-w-0 flex-col" style={{ background: '#101214' }}>
          {/* Header perfeitamente alinhado com o topo da sidebar */}
          <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center justify-between border-b border-[#1e2530] bg-[#0c0f14] px-5 sm:px-10">
            <button onClick={() => setActiveModule('hub')} className="lg:hidden">
              <Logo isDark className="h-8" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#3a4f63] tracking-wider">PORTAL DO COLABORADOR</span>
              <span className="text-[#2d3a4a]">/</span>
              <span className="font-mono text-[10px] font-bold text-[#e3141a] tracking-wider">
                {activeModule === 'hub' ? 'INÍCIO' : (moduleItems.find(m => m.key === activeModule)?.title || 'PTs').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveModule('hub')}
                className={`${activeModule === 'hub' ? 'hidden' : 'inline-flex'} items-center gap-1.5 border border-[#2c3035] px-3 py-1.5 text-xs font-semibold text-[#6b82a0] transition hover:border-[#e3141a] hover:text-white`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Menu
              </button>
            </div>
          </header>

          {/* Hub ou Módulo ativo */}
          {activeModule === 'hub' ? (
            <main style={{ background: '#101214' }}>
              {/* Hero */}
              <section className="border-b border-[#1e2530] px-5 py-12 sm:px-10">
                <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#e3141a] uppercase mb-3">DISTRIBUIDORA IRMÃOS BARREIRO</p>
                <h1 className="font-condensed text-4xl font-extrabold uppercase tracking-tight text-white sm:text-5xl">Portal do Colaborador</h1>
                <p className="mt-3 text-sm text-[#8d9096] max-w-xl leading-relaxed">
                  Plataforma interna de RH para cadastro, diaristas, recibos, relatórios e permissões de trabalho.
                </p>
              </section>

              {/* Grid de módulos */}
              <section className="px-5 py-10 sm:px-10">
                <div className="mb-7 flex items-end justify-between">
                  <h2 className="font-condensed text-3xl font-bold uppercase text-white">Módulos disponíveis</h2>
                  <span className="font-mono text-[10px] font-semibold text-[#ffc72c]">6 MÓDULOS · ACESSO OPERACIONAL</span>
                </div>

                {/* Grid com exatamente 6 caixinhas uniformes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {moduleItems.map(item => {
                    const isPt = item.key === 'pts';
                    return (
                      <button
                        key={item.key}
                        onClick={() => openModule(item)}
                        className={`group flex min-h-[220px] flex-col justify-between border bg-[#191c1f]/95 p-6 text-left transition hover:bg-[#1f2226] ${
                          isPt
                            ? 'border-[#ffc72c]/60 hover:border-[#ffc72c]'
                            : 'border-[#2c3035] hover:border-[#e3141a]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-mono text-[10px] font-bold ${isPt ? 'text-[#ffc72c]' : 'text-[#e3141a]'}`}>{item.id}</span>
                            <span className="font-mono text-[9px] text-[#4d6278] uppercase">{item.category}</span>
                          </div>
                          <h3 className="font-condensed mt-3 text-2xl font-bold uppercase text-white leading-tight">{item.title}</h3>
                          <p className="mt-2 text-xs leading-relaxed text-[#8d9096]">{item.desc}</p>
                        </div>
                        <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#f2f2ef] group-hover:text-white">
                          <i className={`h-px w-4 shrink-0 ${isPt ? 'bg-[#ffc72c]' : 'bg-[#e3141a]'}`} />
                          {item.action}
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </main>
          ) : (
            <main className="flex-1 p-5 sm:p-8 lg:p-10">{content}</main>
          )}

          {/* Footer perfeitamente alinhado com o rodapé da sidebar */}
          <footer className="mt-auto h-14 shrink-0 border-t border-[#1e2530] bg-[#0c0f14] px-5 sm:px-10 flex items-center">
            <div className="w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Logo isDark className="h-6 opacity-75 shrink-0" />
                <div className="border-l border-[#1e2530] pl-3 flex items-center h-4">
                  <p className="text-xs font-medium text-[#6b82a0] whitespace-nowrap">Distribuidora Irmãos Barreiro · Cascavel — CE</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <span className="font-mono text-[10px] text-[#4d6278] whitespace-nowrap">© {new Date().getFullYear()} IRMÃOS BARREIRO</span>
                <span className="h-3 w-px bg-[#1e2530]" />
                <button onClick={() => navigate('/politica-de-privacidade')} className="font-mono text-[10px] font-semibold text-[#4d6278] hover:text-[#e3141a] transition-colors whitespace-nowrap">
                  POLÍTICA DE PRIVACIDADE
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

