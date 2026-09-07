const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://distribuidorabarreirosbebidasltda.up.railway.app/api/v1';

// Gerenciamento seguro do Token JWT
export function getAuthToken() {
  try {
    return sessionStorage.getItem('token_barreiro') || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      sessionStorage.setItem('token_barreiro', token);
    } else {
      sessionStorage.removeItem('token_barreiro');
    }
  } catch (err) {
    console.warn('Falha ao salvar token na sessão:', err);
  }
}

export function removeAuthToken() {
  try {
    sessionStorage.removeItem('token_barreiro');
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
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Erro ao realizar login');
  }
  const data = await res.json();
  if (data && data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
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