function sanitizeApiUrl(url) {
  // Localhost é somente o padrão de desenvolvimento. Em produção, a URL
  // deve ser configurada no Railway antes do build do Vite.
  if (!url) {
    const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
    return isLocal ? 'http://localhost:8000/api/v1' : '';
  }
  let clean = url.trim();
  // Corrige caso tenha https://https:// ou http://https:// duplicado
  clean = clean.replace(/^(https?:\/\/)+/i, 'https://');
  // Normaliza o /api/v1 final sem barras duplas
  clean = clean.replace(/\/+api\/v1\/?$/i, '/api/v1');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = sanitizeApiUrl(rawApiUrl);

function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('API não configurada no Railway. Defina VITE_API_URL no serviço do frontend e faça um novo deploy.');
  }
  return `${API_BASE_URL}${path}`;
}

// A sessão é mantida em cookie HttpOnly; nenhum JWT fica acessível ao JavaScript.
async function fetch(url, options = {}) {
  return window.fetch(url, { ...options, credentials: 'include' });
}

// Gerenciamento seguro do Token JWT
export function getAuthToken() {
  try {
    return '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      return;
    } else {
      return;
    }
  } catch (err) {
    console.warn('Falha ao salvar token na sessão:', err);
  }
}

export function removeAuthToken() {
  try {
    return;
  } catch (err) {
    console.warn('Falha ao remover token da sessão:', err);
  }
}

function getAuthHeaders(customHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginApi(email, senha) {
  let res;
  try {
    res = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
  } catch (err) {
    if (err?.message?.startsWith('API não configurada')) throw err;
    throw new Error('Não foi possível conectar à API. Verifique se o serviço do backend está ativo no Railway.');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Erro ao realizar login');
  }
  const data = await res.json();
  // Remove qualquer token legado do sessionStorage; a sessão atual está no cookie HttpOnly.
  setAuthToken('');
  return data;
}

// A browser token is only valid after the configured backend confirms it.
export async function getCurrentUserApi() {
  const token = getAuthToken();
  if (!token) throw new Error('Sessao inexistente');

  const res = await fetch(getApiUrl('/auth/me'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Sessao invalida ou API indisponivel');
  return await res.json();
}

export async function getDiaristasApi(dataIso, mesIso) {
  let url = `${API_BASE_URL}/diaristas`;
  if (dataIso) {
    url += `?data=${encodeURIComponent(dataIso)}`;
  } else if (mesIso) {
    url += `?mes=${encodeURIComponent(mesIso)}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao buscar diaristas (autorização necessária)');
  return await res.json();
}

export async function getDatasDisponiveisApi() {
  const res = await fetch(`${API_BASE_URL}/diaristas/datas-disponiveis`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao buscar datas disponíveis');
  return await res.json();
}

export async function createDiaristaApi(diaristaData) {
  const res = await fetch(`${API_BASE_URL}/diaristas`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(diaristaData),
  });
  if (!res.ok) throw new Error('Erro ao criar diarista');
  return await res.json();
}

export async function toggleStatusPagoApi(id) {
  const res = await fetch(`${API_BASE_URL}/diaristas/${id}/status-pago`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao atualizar status');
  return await res.json();
}

export async function deleteDiaristaApi(id) {
  const res = await fetch(`${API_BASE_URL}/diaristas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao remover diarista');
  return await res.json();
}

export async function resetDiaristasApi(dataIso) {
  if (!dataIso) {
    throw new Error('A data de referência deve ser obrigatoriamente informada para limpeza de diárias.');
  }
  const url = `${API_BASE_URL}/diaristas/reset/dia?data=${encodeURIComponent(dataIso)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao resetar diárias');
  return await res.json();
}

export async function getFuncionariosBaseApi(query = '') {
  const url = query ? `${API_BASE_URL}/funcionarios-base?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/funcionarios-base`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao buscar banco de funcionários');
  return await res.json();
}

export async function createColaboradorApi(formData) {
  const res = await fetch(`${API_BASE_URL}/colaboradores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error('Erro ao cadastrar ficha de colaborador');
  return await res.json();
}

export async function createPessoaJuridicaApi(formData) {
  const res = await fetch(`${API_BASE_URL}/pessoas-juridicas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error('Erro ao cadastrar pessoa jurídica');
  return await res.json();
}

export async function getDocumentosPessoaJuridicaApi(id) {
  const res = await fetch(`${API_BASE_URL}/pessoas-juridicas/${id}/documentos`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Não foi possível carregar os documentos');
  return await res.json();
}

export async function enviarDocumentoPessoaJuridicaApi(id, posicao, arquivo) {
  const dados = new FormData();
  dados.append('posicao', posicao); dados.append('arquivo', arquivo);
  const res = await fetch(`${API_BASE_URL}/pessoas-juridicas/${id}/documentos`, { method: 'POST', headers: getAuthHeaders(), body: dados });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Não foi possível anexar o documento');
  return await res.json();
}

export async function baixarDocumentoPessoaJuridicaApi(id, documentoId) {
  const res = await fetch(`${API_BASE_URL}/pessoas-juridicas/${id}/documentos/${documentoId}/arquivo`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Não foi possível abrir o documento');
  return await res.blob();
}

export async function removerDocumentoPessoaJuridicaApi(id, documentoId) {
  const res = await fetch(`${API_BASE_URL}/pessoas-juridicas/${id}/documentos/${documentoId}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Não foi possível remover o documento');
}

export async function getDocumentosColaboradorApi(colaboradorId) {
  const res = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}/documentos`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Nao foi possivel carregar os documentos anexados');
  return await res.json();
}

export async function enviarDocumentoColaboradorApi(colaboradorId, tipoDocumento, arquivo) {
  const dados = new FormData();
  dados.append('tipo_documento', tipoDocumento);
  dados.append('arquivo', arquivo);
  const res = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}/documentos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: dados,
  });
  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    throw new Error(erro.detail || 'Nao foi possivel anexar o documento');
  }
  return await res.json();
}

export async function baixarDocumentoColaboradorApi(colaboradorId, documentoId) {
  const res = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}/documentos/${documentoId}/arquivo`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Nao foi possivel abrir o documento');
  return await res.blob();
}

export async function removerDocumentoColaboradorApi(colaboradorId, documentoId) {
  const res = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorId}/documentos/${documentoId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Nao foi possivel remover o documento');
}

export async function emitirReciboApi(reciboData) {
  const res = await fetch(`${API_BASE_URL}/recibos`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(reciboData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Erro ao emitir recibo');
  }
  return await res.json();
}

export async function getRecibosApi() {
  const res = await fetch(`${API_BASE_URL}/recibos`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao buscar histórico de recibos');
  return await res.json();
}

// Módulo 5: Registro de Funcionários (Entrada, Histórico e Relatórios)
export async function getRegistrosFuncionariosApi() {
  const res = await fetch(`${API_BASE_URL}/funcionarios-base/registros`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao carregar registros de funcionários');
  return await res.json();
}

export async function createRegistroFuncionarioApi(dados) {
  const res = await fetch(`${API_BASE_URL}/funcionarios-base/registros`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao registrar funcionário');
  }
  return await res.json();
}

export async function updateRegistroFuncionarioApi(id, dados) {
  const res = await fetch(`${API_BASE_URL}/funcionarios-base/registros/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao atualizar funcionário');
  }
  return await res.json();
}

export async function deleteRegistroFuncionarioApi(id) {
  const res = await fetch(`${API_BASE_URL}/funcionarios-base/registros/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao excluir funcionário');
  return await res.json();
}

export async function getRelatorioFuncionarioApi(id) {
  const res = await fetch(`${API_BASE_URL}/funcionarios-base/registros/${id}/relatorio`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Erro ao buscar relatório do funcionário');
  return await res.json();
}

// ============================================================
// Módulo 6: Permissões de Trabalho (PTs)
// ============================================================

export async function getPTsApi(tipo, status) {
  let url = `${API_BASE_URL}/permissoes-trabalho`;
  const params = [];
  if (tipo) params.push(`tipo=${encodeURIComponent(tipo)}`);
  if (status) params.push(`status=${encodeURIComponent(status)}`);
  if (params.length) url += `?${params.join('&')}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Erro ao buscar Permissões de Trabalho');
  return await res.json();
}

export async function getPTByIdApi(id) {
  const res = await fetch(`${API_BASE_URL}/permissoes-trabalho/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('PT não encontrada');
  return await res.json();
}

export async function createPTApi(dados) {
  const res = await fetch(`${API_BASE_URL}/permissoes-trabalho`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao criar Permissão de Trabalho');
  }
  return await res.json();
}

export async function updatePTApi(id, dados) {
  const res = await fetch(`${API_BASE_URL}/permissoes-trabalho/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao atualizar PT');
  }
  return await res.json();
}

export async function updateStatusPTApi(id, novoStatus) {
  const res = await fetch(
    `${API_BASE_URL}/permissoes-trabalho/${id}/status?novo_status=${encodeURIComponent(novoStatus)}`,
    { method: 'PATCH', headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error('Erro ao atualizar status da PT');
  return await res.json();
}

export async function deletePTApi(id) {
  const res = await fetch(`${API_BASE_URL}/permissoes-trabalho/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao remover PT');
  return await res.json();
}
