import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { createColaboradorApi } from '../services/api';
import {
  User,
  MapPin,
  CreditCard,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Printer,
  RotateCcw,
  ShieldCheck,
  Building2,
  AlertCircle,
  Clock,
  QrCode,
  FileCheck,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Funções de validação
function isValidCPF(cpf) {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 10 && clean.length <= 11;
}

export default function FormularioColaborador({ userEmail = '', onLogout, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = useRef(null);

  // Form State com todas as informações possíveis
  const [formData, setFormData] = useState({
    // Etapa 1: Dados Pessoais
    nome: '',
    cpf: '',
    email: userEmail || '',
    telefone: '',
    dataNascimento: '',
    rg: '',

    // Etapa 2: Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Cascavel',
    estado: 'CE',

    // Etapa 3: Dados Bancários
    banco: 'Caixa Econômica Federal',
    outroBanco: '',
    tipoConta: 'Conta Corrente',
    agencia: '',
    conta: '',
    tipoPix: 'CPF',
    chavePix: '',

    // Etapa 4: Dados Profissionais
    cargo: 'Motorista Entregador',
    outroCargo: '',
    unidade: 'Distrito Industrial de Cascavel - CE',
    turno: 'Diurno (Comercial / Rota)',
    sede: 'Rua João Damasceno Fontenele, nº 5003 - Cascavel/CE',
    aceitouTermos: true
  });

  // Erros e campos tocados
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [protocolo] = useState(() => {
    const ano = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `IB-${ano}-${rand}`;
  });

  const [dataEmissao] = useState(() => {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  });

  // Geração do PDF em formato oficial A4 com html2canvas + jsPDF
  async function handleDownloadPDF() {
    if (!pdfRef.current || isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      const element = pdfRef.current;

      // Aguarda fontes do navegador
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Captura via html2canvas com renderização em layout A4 padrão de 820px
      const canvas = await html2canvas(element, {
        scale: 2.5, // Alta definição (nítido para impressão)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        onclone: (clonedDoc, clonedEl) => {
          // Padroniza o elemento para formato de página A4 sem cortes e sem distorção
          clonedEl.style.width = '820px';
          clonedEl.style.maxWidth = '820px';
          clonedEl.style.minWidth = '820px';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.borderRadius = '0px';
          clonedEl.style.border = 'none';
          clonedEl.style.padding = '24px 28px';
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210; // A4 largura total em mm
      const pdfHeight = 297; // A4 altura total em mm
      const marginX = 10; // 10mm de margem horizontal
      const marginY = 10; // 10mm de margem vertical
      const printableWidth = pdfWidth - marginX * 2; // 190mm de largura útil
      const printableHeight = (canvas.height * printableWidth) / canvas.width;

      // Se couber em 1 página A4 com margens
      if (printableHeight <= pdfHeight - marginY * 2) {
        pdf.addImage(imgData, 'JPEG', marginX, marginY, printableWidth, printableHeight, undefined, 'FAST');
      } else {
        const maxAvailableHeight = pdfHeight - marginY * 2;
        const scaleFactor = maxAvailableHeight / printableHeight;
        
        // Se ultrapassar levemente, ajusta proporcionalmente para 1 página mantendo perfeita leitura
        if (scaleFactor >= 0.82) {
          const scaledW = printableWidth * scaleFactor;
          const leftM = (pdfWidth - scaledW) / 2;
          pdf.addImage(imgData, 'JPEG', leftM, marginY, scaledW, maxAvailableHeight, undefined, 'FAST');
        } else {
          // Se for extenso, divide em páginas A4 sem cortar texto
          const pageCanvasHeight = (canvas.width * maxAvailableHeight) / printableWidth;
          let currentY = 0;
          let pageNum = 0;

          while (currentY < canvas.height) {
            if (pageNum > 0) pdf.addPage();

            const chunkCanvas = document.createElement('canvas');
            const chunkHeight = Math.min(pageCanvasHeight, canvas.height - currentY);
            chunkCanvas.width = canvas.width;
            chunkCanvas.height = chunkHeight;

            const ctx = chunkCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, chunkCanvas.width, chunkHeight);
              ctx.drawImage(
                canvas,
                0,
                currentY,
                canvas.width,
                chunkHeight,
                0,
                0,
                canvas.width,
                chunkHeight
              );

              const chunkImg = chunkCanvas.toDataURL('image/jpeg', 0.98);
              const renderedHeight = (chunkHeight * printableWidth) / canvas.width;
              pdf.addImage(chunkImg, 'JPEG', marginX, marginY, printableWidth, renderedHeight, undefined, 'FAST');
            }

            currentY += pageCanvasHeight;
            pageNum++;
          }
        }
      }

      const nomeArquivo = `Ficha_Cadastral_${(formData.nome || 'Colaborador').replace(/\s+/g, '_')}_${protocolo}.pdf`;
      
      // Download direto via Blob padrão
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = nomeArquivo;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error('Erro detalhado ao gerar PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  // Helpers de formatação automática
  function formatCPF(val) {
    const v = val.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`;
  }

  function formatPhone(val) {
    const v = val.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 2) return v;
    if (v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  }

  function formatCEP(val) {
    const v = val.replace(/\D/g, '').slice(0, 8);
    if (v.length <= 5) return v;
    return `${v.slice(0, 5)}-${v.slice(5, 8)}`;
  }

  function formatRG(val) {
    return val.replace(/[^a-zA-Z0-9.\-\/\s]/g, '').slice(0, 20);
  }

  function formatAgencia(val) {
    const clean = val.replace(/[^0-9xX]/g, '').toUpperCase().slice(0, 5);
    if (clean.length <= 4) return clean;
    return `${clean.slice(0, 4)}-${clean.slice(4, 5)}`;
  }

  function formatConta(val) {
    const clean = val.replace(/[^0-9xX]/g, '').toUpperCase().slice(0, 13);
    if (clean.length <= 1) return clean;
    return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
  }

  // Validação por campo
  function validateField(field, value) {
    let errorMsg = '';
    if (field === 'cpf') {
      if (!value) {
        errorMsg = 'CPF é obrigatório';
      } else if (!isValidCPF(value)) {
        errorMsg = 'CPF inválido. Verifique os números digitados.';
      }
    }

    if (field === 'rg') {
      if (!value.trim()) {
        errorMsg = 'RG / Órgão Emissor é obrigatório';
      }
    }

    if (field === 'email') {
      if (value && !isValidEmail(value)) {
        errorMsg = 'Por favor, informe um e-mail válido (ex: nome@empresa.com)';
      }
    }

    if (field === 'telefone') {
      if (!value) {
        errorMsg = 'Telefone é obrigatório';
      } else if (!isValidPhone(value)) {
        errorMsg = 'Informe um telefone com DDD válido (10 ou 11 dígitos)';
      }
    }

    if (field === 'nome') {
      if (!value.trim()) {
        errorMsg = 'Nome completo é obrigatório';
      } else if (value.trim().split(' ').length < 2) {
        errorMsg = 'Informe o nome e sobrenome completo';
      }
    }

    if (field === 'cep') {
      const cleanCep = value.replace(/\D/g, '');
      if (!value) {
        errorMsg = 'CEP é obrigatório';
      } else if (cleanCep.length < 8) {
        errorMsg = 'CEP incompleto (8 dígitos)';
      }
    }

    if (field === 'logradouro' && !value.trim()) {
      errorMsg = 'Rua/Logradouro é obrigatório';
    }

    if (field === 'numero' && !value.trim()) {
      errorMsg = 'Número é obrigatório';
    }

    if (field === 'bairro' && !value.trim()) {
      errorMsg = 'Bairro é obrigatório';
    }

    if (field === 'chavePix' && !value.trim()) {
      errorMsg = 'Chave PIX é obrigatória';
    }

    if (field === 'agencia') {
      if (!value.trim()) {
        errorMsg = 'Agência é obrigatória';
      } else if (value.replace(/[^0-9xX]/g, '').length < 2) {
        errorMsg = 'Informe uma agência válida (mínimo 2 dígitos)';
      }
    }

    if (field === 'conta') {
      if (!value.trim()) {
        errorMsg = 'Conta com dígito é obrigatória';
      } else if (value.replace(/[^0-9xX]/g, '').length < 3) {
        errorMsg = 'Informe a conta completa com dígito';
      }
    }

    if (field === 'outroBanco') {
      if (formData.banco === 'Outro' && !value.trim()) {
        errorMsg = 'Informe o nome da instituição bancária';
      }
    }

    if (field === 'outroCargo') {
      if (formData.cargo === 'Outro' && !value.trim()) {
        errorMsg = 'Informe o nome da sua função ou cargo';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return !errorMsg;
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  }

  // Busca de CEP automática via ViaCEP
  async function handleCepLookup(cepValue) {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      setErrors((prev) => ({ ...prev, cep: '' }));
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (data.erro) {
          setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado na base dos Correios' }));
        } else {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
          setErrors((prev) => ({
            ...prev,
            logradouro: '',
            bairro: '',
            cep: ''
          }));
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, cep: 'Erro ao consultar CEP automaticamente' }));
      } finally {
        setLoadingCep(false);
      }
    }
  }

  function handleChange(field, value) {
    let formatted = value;
    if (field === 'cpf') formatted = formatCPF(value);
    if (field === 'telefone') formatted = formatPhone(value);
    if (field === 'rg') formatted = formatRG(value);
    if (field === 'agencia') formatted = formatAgencia(value);
    if (field === 'conta') formatted = formatConta(value);
    if (field === 'cep') {
      formatted = formatCEP(value);
      handleCepLookup(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [field]: formatted };
      if (field === 'banco' && formatted !== 'Outro') {
        updated.outroBanco = '';
      }
      if (field === 'cargo' && formatted !== 'Outro') {
        updated.outroCargo = '';
      }
      return updated;
    });

    if (field === 'banco' && formatted !== 'Outro') {
      setErrors((prev) => ({ ...prev, outroBanco: '' }));
    }
    if (field === 'cargo' && formatted !== 'Outro') {
      setErrors((prev) => ({ ...prev, outroCargo: '' }));
    }

    if (touched[field]) {
      validateField(field, formatted);
    }
  }

  function validateCurrentStep() {
    let valid = true;
    const newErrors = {};
    const newTouched = { ...touched };

    if (currentStep === 1) {
      if (!validateField('nome', formData.nome)) {
        newErrors.nome = 'Nome completo é obrigatório';
        valid = false;
      }
      if (!validateField('cpf', formData.cpf)) {
        newErrors.cpf = !formData.cpf ? 'CPF é obrigatório' : 'CPF inválido';
        valid = false;
      }
      if (!validateField('rg', formData.rg)) {
        newErrors.rg = 'RG / Órgão Emissor é obrigatório';
        valid = false;
      }
      if (formData.email && !validateField('email', formData.email)) {
        newErrors.email = 'E-mail inválido';
        valid = false;
      }
      if (!validateField('telefone', formData.telefone)) {
        newErrors.telefone = !formData.telefone ? 'Telefone é obrigatório' : 'Telefone incompleto';
        valid = false;
      }
      newTouched.nome = true;
      newTouched.cpf = true;
      newTouched.rg = true;
      newTouched.telefone = true;
    } else if (currentStep === 2) {
      if (!validateField('cep', formData.cep)) {
        newErrors.cep = 'CEP obrigatório';
        valid = false;
      }
      if (!validateField('logradouro', formData.logradouro)) {
        newErrors.logradouro = 'Rua obrigatória';
        valid = false;
      }
      if (!validateField('numero', formData.numero)) {
        newErrors.numero = 'Número obrigatório';
        valid = false;
      }
      if (!validateField('bairro', formData.bairro)) {
        newErrors.bairro = 'Bairro obrigatório';
        valid = false;
      }
      newTouched.cep = true;
      newTouched.logradouro = true;
      newTouched.numero = true;
      newTouched.bairro = true;
    } else if (currentStep === 3) {
      if (!validateField('chavePix', formData.chavePix)) {
        newErrors.chavePix = 'Chave PIX é obrigatória';
        valid = false;
      }
      newTouched.chavePix = true;

      if (!validateField('agencia', formData.agencia)) {
        newErrors.agencia = !formData.agencia ? 'Agência é obrigatória' : 'Informe uma agência válida';
        valid = false;
      }
      newTouched.agencia = true;

      if (!validateField('conta', formData.conta)) {
        newErrors.conta = !formData.conta ? 'Conta com dígito é obrigatória' : 'Informe a conta completa com dígito';
        valid = false;
      }
      newTouched.conta = true;

      if (formData.banco === 'Outro') {
        if (!validateField('outroBanco', formData.outroBanco)) {
          newErrors.outroBanco = 'Informe o nome da instituição bancária';
          valid = false;
        }
        newTouched.outroBanco = true;
      }
    } else if (currentStep === 4) {
      if (formData.cargo === 'Outro') {
        if (!validateField('outroCargo', formData.outroCargo)) {
          newErrors.outroCargo = 'Informe o nome da sua função ou cargo';
          valid = false;
        }
        newTouched.outroCargo = true;
      }
    }

    setTouched(newTouched);
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  }

  async function handleNext(e) {
    e.preventDefault();
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
    } else {
      try {
        await createColaboradorApi({
          nome_completo: formData.nome,
          cpf: formData.cpf,
          rg: formData.rg,
          data_nascimento: formData.dataNascimento,
          email: formData.email,
          telefone: formData.telefone,
          cep: formData.cep,
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          banco: formData.banco,
          outro_banco: formData.outroBanco,
          tipo_conta: formData.tipoConta,
          agencia: formData.agencia,
          conta: formData.conta,
          tipo_pix: formData.tipoPix,
          chave_pix: formData.chavePix,
          cargo: formData.cargo,
          outro_cargo: formData.outroCargo,
          unidade: formData.unidade,
          turno: formData.turno,
          sede: formData.sede,
          aceitou_termos: formData.aceitouTermos
        });
      } catch (err) {
        console.warn("Erro ao salvar no PostgreSQL, continuando com visualização do PDF local...", err);
      }
      setIsCompleted(true);
    }
  }

  function handlePrev() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleStepClick(stepId) {
    if (stepId <= maxStepReached || stepId === currentStep) {
      setCurrentStep(stepId);
    } else if (stepId === currentStep + 1) {
      if (validateCurrentStep()) {
        setCurrentStep(stepId);
        setMaxStepReached((prev) => Math.max(prev, stepId));
      }
    }
  }

  const steps = [
    { id: 1, title: 'Dados pessoais', icon: User },
    { id: 2, title: 'Endereço', icon: MapPin },
    { id: 3, title: 'Dados bancários', icon: CreditCard },
    { id: 4, title: 'Profissionais', icon: Briefcase }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Botão de retorno ao Menu de Módulos (Hub) */}
      {onBack && (
        <div className="no-print flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-200/80 shadow-xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-700 hover:text-red-600 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Menu Principal</span>
          </button>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline">
            Relatório com Dados Individuais
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TELA DE SUCESSO & COMPROVANTE OFICIAL FORMATADO PARA PDF/PRINT */}
      {/* ============================================================ */}
      {isCompleted ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* BARRA DE AÇÕES NA TELA (Oculta na impressão do PDF) */}
          <div className="no-print bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900">
                  Ficha Cadastral Gerada com Sucesso
                </h3>
                <p className="text-xs text-zinc-500">
                  Visualize os dados abaixo ou gere o arquivo PDF oficial com carimbo corporativo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white shadow-md shadow-red-600/25 transition-all cursor-pointer"
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Salvar / Imprimir PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentStep(1);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DOCUMENTO OFICIAL A4 PARA VISUALIZAÇÃO E IMPRESSÃO (PDF)     */}
          {/* ============================================================ */}
          <div ref={pdfRef} data-pdf-root className="print-document bg-white text-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xl space-y-4 max-w-4xl mx-auto">
            
            {/* CABEÇALHO EXECUTIVO OFICIAL */}
            <div className="border-b-2 border-red-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Logo className="h-12 sm:h-14 shrink-0" />
                <div className="border-l border-zinc-300 pl-3">
                  <h1 className="text-base sm:text-lg font-black text-zinc-950 uppercase tracking-tight leading-tight">
                    Distribuidora Irmãos Barreiro de Bebidas
                  </h1>
                  <p className="text-xs text-zinc-500 font-medium">
                    Comprovante Oficial de Cadastro e Alocação Operacional
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Sede: Distrito Industrial, Cascavel - CE
                  </p>
                </div>
              </div>

              {/* Box de Protocolo */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-left sm:text-right min-w-[190px] shrink-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Protocolo Oficial
                </span>
                <span className="text-sm font-mono font-black text-red-600 block">
                  {protocolo}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Emissão: {dataEmissao}
                </span>
              </div>
            </div>

            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-1.5">
                <User className="w-4 h-4 text-red-600 shrink-0" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
                  1. Identificação Pessoal do Colaborador
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="col-span-2 bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Nome Completo</span>
                  <span className="text-sm font-bold text-zinc-900">{formData.nome || 'Não informado'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">CPF</span>
                  <span className="font-bold text-zinc-900 font-mono">{formData.cpf || 'Não informado'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">RG / Órgão Emissor</span>
                  <span className="font-bold text-zinc-900">{formData.rg || 'Não informado'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Telefone / WhatsApp</span>
                  <span className="font-bold text-zinc-900">{formData.telefone || 'Não informado'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">E-mail</span>
                  <span className="font-bold text-zinc-900 truncate block">{formData.email || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: ENDEREÇO RESIDENCIAL */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-1.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
                  2. Endereço Residencial
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="col-span-2 bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Logradouro / Rua</span>
                  <span className="font-bold text-zinc-900">{formData.logradouro || 'Não informado'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Número</span>
                  <span className="font-bold text-zinc-900">{formData.numero || 'S/N'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Complemento</span>
                  <span className="font-bold text-zinc-900">{formData.complemento || '—'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Bairro</span>
                  <span className="font-bold text-zinc-900">{formData.bairro || 'Não informado'}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">CEP</span>
                  <span className="font-bold text-zinc-900 font-mono">{formData.cep || 'Não informado'}</span>
                </div>

                <div className="col-span-2 bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Município / UF</span>
                  <span className="font-bold text-zinc-900">{formData.cidade} - {formData.estado}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: DADOS BANCÁRIOS */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-1.5">
                <CreditCard className="w-4 h-4 text-red-600 shrink-0" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
                  3. Informações Bancárias & Pagamento
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="col-span-2 bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Instituição Bancária</span>
                  <span className="font-bold text-zinc-900">
                    {formData.banco === 'Outro' ? (formData.outroBanco || 'Outra Instituição') : formData.banco}
                  </span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Tipo de Conta</span>
                  <span className="font-bold text-zinc-900">{formData.tipoConta}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Agência / Conta</span>
                  <span className="font-bold text-zinc-900 font-mono">
                    Ag: {formData.agencia || '—'} | Cc: {formData.conta || '—'}
                  </span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Tipo de PIX</span>
                  <span className="font-bold text-zinc-900">{formData.tipoPix}</span>
                </div>

                <div className="col-span-3 bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Chave PIX Cadastrada</span>
                  <span className="font-bold text-red-600 font-mono">{formData.chavePix || formData.cpf || 'Cadastrada'}</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: DADOS PROFISSIONAIS */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-1.5">
                <Briefcase className="w-4 h-4 text-red-600 shrink-0" />
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
                  4. Atribuição Profissional & Unidade
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Cargo / Função</span>
                  <span className="font-bold text-zinc-900">
                    {formData.cargo === 'Outro' ? (formData.outroCargo || 'Outra Função') : formData.cargo}
                  </span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Unidade Operacional</span>
                  <span className="font-bold text-zinc-900">{formData.unidade}</span>
                </div>

                <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Turno de Trabalho</span>
                  <span className="font-bold text-zinc-900">{formData.turno}</span>
                </div>
              </div>
            </div>

            {/* TERMO E AUTENTICAÇÃO */}
            <div className="pt-3 border-t border-zinc-200 space-y-4 text-xs">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-zinc-600 leading-relaxed text-[11px]">
                <p>
                  <strong>Declaração de Veracidade e Sigilo:</strong> O colaborador declara sob as penas da lei que todas as informações acima são verídicas e atualizadas, autorizando o tratamento de seus dados pessoais exclusivamente para fins trabalhistas, cadastrais e bancários pela <strong>Distribuidora Irmãos Barreiro de Bebidas</strong> em conformidade com a LGPD (Lei Federal nº 13.709/2018).
                </p>
              </div>

              {/* ASSINATURAS (Para documento impresso) */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="border-t border-zinc-400 pt-1.5">
                  <p className="font-bold text-zinc-900">{formData.nome || 'Assinatura do Colaborador'}</p>
                  <p className="text-[10px] text-zinc-500">Colaborador / Titular dos Dados</p>
                </div>

                <div className="border-t border-zinc-400 pt-1.5">
                  <p className="font-bold text-zinc-900">Distribuidora Irmãos Barreiro</p>
                  <p className="text-[10px] text-zinc-500">Depto. de Pessoal / Validação RH</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* CONTAINER PRINCIPAL DO FORMULÁRIO (SIDEBAR DESKTOP + STEPPER MOBILE) */
        <div className="space-y-4">

          {/* STEPPER SUPERIOR COMPACTO (EXCLUSIVO PARA MOBILE < md) */}
          <div className="md:hidden bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800 shadow-lg">
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;
                const isClickable = step.id <= maxStepReached || step.id === currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md'
                        : isPast
                        ? 'bg-zinc-800 text-emerald-400'
                        : 'bg-zinc-800/60 text-zinc-400 opacity-60'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span>{step.id}. {step.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD PRINCIPAL EM GRID */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px]">

            {/* SIDEBAR ESQUERDA (DESKTOP >= md) */}
            <div className="hidden md:flex md:col-span-4 bg-zinc-900 p-6 flex-col justify-between border-r border-zinc-800 text-white">
              <div className="space-y-3">
                <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <span>Etapas do Cadastro</span>
                  <span className="text-zinc-500 font-mono">{currentStep}/4</span>
                </div>

                <div className="space-y-2">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isPast = currentStep > step.id;
                    const isClickable = step.id <= maxStepReached || step.id === currentStep;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStepClick(step.id)}
                        disabled={!isClickable}
                        className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-left text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold scale-[1.02]'
                            : isPast
                            ? 'bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800 hover:text-white cursor-pointer'
                            : isClickable
                            ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 cursor-pointer'
                            : 'text-zinc-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isPast
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {isPast ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="block truncate font-bold text-[13px]">{step.title}</span>
                          <span className="text-[11px] font-normal opacity-80 block mt-0.5">
                            {isActive ? 'Em preenchimento' : isPast ? 'Concluído' : 'Pendente'}
                          </span>
                        </div>

                        <div>
                          {isPast ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                              ✓
                            </span>
                          ) : isActive ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-white">
                              {currentStep * 25}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-500">
                              {step.id}/4
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Informação no rodapé da sidebar */}
              <div className="pt-5 mt-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span>Navegação Rápida</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Clique nas etapas concluídas para revisar ou ajustar qualquer informação a qualquer momento.
                </p>
              </div>
            </div>

            {/* PAINEL DIREITO (Conteúdo do Formulário) */}
            <div className="md:col-span-8 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
              <form onSubmit={handleNext} className="space-y-6 flex-1 flex flex-col justify-between">

                <div>
                  {/* Cabeçalho da Etapa Ativa */}
                  <div className="mb-5 pb-4 border-b border-zinc-100 flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                        {steps[currentStep - 1].title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Etapa {currentStep} de 4 • Preencha os campos obrigatórios com atenção
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <span>{currentStep * 25}% Concluído</span>
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso Fina */}
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-6">
                    <div
                      className="bg-red-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${currentStep * 25}%` }}
                    />
                  </div>

                  {/* ============================================================ */}
                  {/* ETAPA 1: DADOS PESSOAIS                                      */}
                  {/* ============================================================ */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Nome Completo <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleChange('nome', e.target.value)}
                            onBlur={() => handleBlur('nome')}
                            placeholder="Ex: João da Silva Barreiro"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.nome && errors.nome
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.nome && errors.nome && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.nome}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            CPF <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cpf}
                            onChange={(e) => handleChange('cpf', e.target.value)}
                            onBlur={() => handleBlur('cpf')}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-mono font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.cpf && errors.cpf
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.cpf && errors.cpf && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.cpf}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            RG / Órgão Emissor <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.rg}
                            onChange={(e) => handleChange('rg', e.target.value)}
                            onBlur={() => handleBlur('rg')}
                            placeholder="Ex: 2008010... SSP/CE"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.rg && errors.rg
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.rg && errors.rg && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.rg}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Telefone / WhatsApp <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.telefone}
                            onChange={(e) => handleChange('telefone', e.target.value)}
                            onBlur={() => handleBlur('telefone')}
                            placeholder="(85) 99999-9999"
                            maxLength={15}
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.telefone && errors.telefone
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.telefone && errors.telefone && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.telefone}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-extrabold uppercase text-zinc-900 tracking-wide">
                              E-mail
                            </label>
                            <span className="text-zinc-400 font-medium text-[11px] lowercase">(opcional)</span>
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            placeholder="nome@empresa.com"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.email && errors.email
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.email && errors.email && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.email}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* ETAPA 2: ENDEREÇO                                            */}
                  {/* ============================================================ */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            CEP <span className="text-red-600 font-black">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.cep}
                              onChange={(e) => handleChange('cep', e.target.value)}
                              onBlur={() => handleBlur('cep')}
                              placeholder="62850-000"
                              maxLength={9}
                              className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-mono font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                                touched.cep && errors.cep
                                  ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                  : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                              }`}
                            />
                            {loadingCep && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 font-semibold animate-pulse">
                                Buscando...
                              </span>
                            )}
                          </div>
                          {touched.cep && errors.cep && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.cep}</span>
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Rua / Logradouro <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.logradouro}
                            onChange={(e) => handleChange('logradouro', e.target.value)}
                            onBlur={() => handleBlur('logradouro')}
                            placeholder="Ex: Av. Chanceler Edson Queiroz"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.logradouro && errors.logradouro
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.logradouro && errors.logradouro && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.logradouro}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Número <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.numero}
                            onChange={(e) => handleChange('numero', e.target.value)}
                            onBlur={() => handleBlur('numero')}
                            placeholder="Ex: 5003"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.numero && errors.numero
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.numero && errors.numero && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.numero}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-extrabold uppercase text-zinc-900 tracking-wide">
                              Complemento
                            </label>
                            <span className="text-zinc-400 font-medium text-[11px] lowercase">(opcional)</span>
                          </div>
                          <input
                            type="text"
                            value={formData.complemento}
                            onChange={(e) => handleChange('complemento', e.target.value)}
                            placeholder="Ex: Galpão A, Apto 101"
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Bairro <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.bairro}
                            onChange={(e) => handleChange('bairro', e.target.value)}
                            onBlur={() => handleBlur('bairro')}
                            placeholder="Ex: Distrito Industrial"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.bairro && errors.bairro
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.bairro && errors.bairro && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.bairro}</span>
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Cidade <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cidade}
                            onChange={(e) => handleChange('cidade', e.target.value)}
                            placeholder="Cascavel"
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Estado (UF) <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.estado}
                            onChange={(e) => handleChange('estado', e.target.value)}
                            placeholder="CE"
                            maxLength={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm uppercase transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* ETAPA 3: DADOS BANCÁRIOS                                     */}
                  {/* ============================================================ */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Instituição Bancária <span className="text-red-600 font-black">*</span>
                          </label>
                          <select
                            value={formData.banco}
                            onChange={(e) => handleChange('banco', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium text-sm bg-white outline-none"
                          >
                            <option value="Caixa Econômica Federal">Caixa Econômica Federal</option>
                            <option value="Banco do Brasil">Banco do Brasil</option>
                            <option value="Bradesco">Bradesco</option>
                            <option value="Itaú">Itaú</option>
                            <option value="Santander">Santander</option>
                            <option value="Nubank">Nubank</option>
                            <option value="Banco Inter">Banco Inter</option>
                            <option value="Outro">Outra Instituição</option>
                          </select>

                          {formData.banco === 'Outro' && (
                            <div className="mt-3 animate-fadeIn">
                              <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                                Nome da Instituição Bancária <span className="text-red-600 font-black">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.outroBanco}
                                onChange={(e) => handleChange('outroBanco', e.target.value)}
                                onBlur={() => handleBlur('outroBanco')}
                                placeholder="Digite o nome da sua instituição bancária (ex: C6 Bank, PagBank, Sicredi...)"
                                autoFocus
                                className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                                  touched.outroBanco && errors.outroBanco
                                    ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                                }`}
                              />
                              {touched.outroBanco && errors.outroBanco && (
                                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{errors.outroBanco}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Tipo de Chave PIX <span className="text-red-600 font-black">*</span>
                          </label>
                          <select
                            value={formData.tipoPix}
                            onChange={(e) => handleChange('tipoPix', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium text-sm bg-white outline-none"
                          >
                            <option value="CPF">CPF</option>
                            <option value="E-mail">E-mail</option>
                            <option value="Telefone">Telefone / Celular</option>
                            <option value="Aleatória">Chave Aleatória (EVP)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Chave PIX <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.chavePix}
                            onChange={(e) => handleChange('chavePix', e.target.value)}
                            onBlur={() => handleBlur('chavePix')}
                            placeholder="Informe a chave cadastrada"
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.chavePix && errors.chavePix
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.chavePix && errors.chavePix && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.chavePix}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Agência <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.agencia}
                            onChange={(e) => handleChange('agencia', e.target.value)}
                            onBlur={() => handleBlur('agencia')}
                            placeholder="0000"
                            maxLength={7}
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-mono font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.agencia && errors.agencia
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.agencia && errors.agencia && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.agencia}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Conta com Dígito <span className="text-red-600 font-black">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.conta}
                            onChange={(e) => handleChange('conta', e.target.value)}
                            onBlur={() => handleBlur('conta')}
                            placeholder="0000000-0"
                            maxLength={16}
                            className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-mono font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                              touched.conta && errors.conta
                                ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                            }`}
                          />
                          {touched.conta && errors.conta && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.conta}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* ETAPA 4: PROFISSIONAIS & TERMOS                              */}
                  {/* ============================================================ */}
                  {currentStep === 4 && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Cargo / Função Operacional <span className="text-red-600 font-black">*</span>
                          </label>
                          <select
                            value={formData.cargo}
                            onChange={(e) => handleChange('cargo', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium text-sm bg-white outline-none"
                          >
                            <option value="Ajudante de Motorista">Ajudante de Motorista</option>
                            <option value="Motorista">Motorista</option>
                            <option value="Pintor">Pintor</option>
                            <option value="Mecânico">Mecânico</option>
                            <option value="Eletricista">Eletricista</option>
                            <option value="Técnico de Ar">Técnico de Ar</option>
                            <option value="Técnico de Refrigeração">Técnico de Refrigeração</option>
                            <option value="Jardineiro">Jardineiro</option>
                            <option value="Pedreiro">Pedreiro</option>
                            <option value="Servente">Servente</option>
                            <option value="Vigia">Vigia</option>
                            <option value="Controlador de Pragas">Controlador de Pragas</option>
                            <option value="Soldador">Soldador</option>
                            <option value="Motorista de Carteiro">Motorista de Carteiro</option>
                            <option value="Outro">Outra Função</option>
                          </select>

                          {formData.cargo === 'Outro' && (
                            <div className="mt-3 animate-fadeIn">
                              <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                                Nome da Função / Cargo <span className="text-red-600 font-black">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.outroCargo}
                                onChange={(e) => handleChange('outroCargo', e.target.value)}
                                onBlur={() => handleBlur('outroCargo')}
                                placeholder="Digite a sua função (ex: Eletricista, Mecânico, Repositor...)"
                                autoFocus
                                className={`w-full px-4 py-2.5 rounded-xl border text-zinc-900 font-medium placeholder:text-zinc-400 placeholder:font-normal text-sm transition-all outline-none ${
                                  touched.outroCargo && errors.outroCargo
                                    ? 'border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500/20'
                                    : 'border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
                                }`}
                              />
                              {touched.outroCargo && errors.outroCargo && (
                                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{errors.outroCargo}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Unidade Operacional
                          </label>
                          <input
                            type="text"
                            disabled
                            value={formData.unidade}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Turno de Atuação
                          </label>
                          <select
                            value={formData.turno}
                            onChange={(e) => handleChange('turno', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 text-zinc-900 font-medium text-sm bg-white outline-none"
                          >
                            <option value="Diurno (Comercial / Rota)">Diurno (Comercial / Rota)</option>
                            <option value="Noturno (Carregamento / Logística)">Noturno (Carregamento / Logística)</option>
                            <option value="Escala / Revezamento">Escala / Revezamento</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold uppercase text-zinc-900 tracking-wide mb-1.5">
                            Sede Central
                          </label>
                          <div className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-700 flex items-center gap-2 font-medium">
                            <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Rua João Damasceno Fontenele, 5003</span>
                          </div>
                        </div>
                      </div>

                      {/* Box LGPD */}
                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mt-4">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.aceitouTermos}
                            onChange={(e) => handleChange('aceitouTermos', e.target.checked)}
                            className="mt-1 w-4 h-4 text-red-600 rounded border-zinc-300 focus:ring-red-500"
                          />
                          <span className="text-xs text-zinc-700 leading-relaxed">
                            Confirmo que as informações prestadas são verdadeiras e estou ciente da{' '}
                            <Link
                              to="/politica-de-privacidade"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 font-bold underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Política de Privacidade
                            </Link>{' '}
                            da Distribuidora Irmãos Barreiro para fins cadastrais e operacionais internos.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTÕES DE NAVEGAÇÃO */}
                <div className="pt-6 border-t border-zinc-100 flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="submit"
                    disabled={currentStep === 4 && !formData.aceitouTermos}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 hover:shadow-red-600/35 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{currentStep === 4 ? 'Concluir Cadastro' : 'Continuar'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
