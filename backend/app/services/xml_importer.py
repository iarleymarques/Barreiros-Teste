import xml.etree.ElementTree as ET
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.epi import EPI


def _remover_namespace(tag: str) -> str:
    """Remove o namespace XML (ex: {http://www.portalfiscal.inf.br/nfe}infNFe -> infNFe)."""
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def parse_nfe_xml(xml_bytes: bytes) -> Dict[str, Any]:
    """
    Realiza o parse dos dados de uma NF-e (DANFE XML),
    extraindo dados do emitente, número da nota e itens de produtos.
    """
    root = ET.fromstring(xml_bytes)
    
    # Busca recursiva ignorando namespace
    def find_first(element, target_name):
        for child in element.iter():
            if _remover_namespace(child.tag) == target_name:
                return child
        return None

    # Dados da Nota
    ide = find_first(root, "ide")
    numero_nota = ""
    data_emissao = ""
    if ide is not None:
        n_nf = find_first(ide, "nNF")
        dh_emi = find_first(ide, "dhEmi") or find_first(ide, "dEmi")
        if n_nf is not None and n_nf.text:
            numero_nota = n_nf.text.strip()
        if dh_emi is not None and dh_emi.text:
            data_emissao = dh_emi.text.strip()[:10]

    # Dados do Emitente (Fornecedor)
    emit = find_first(root, "emit")
    emitente_nome = ""
    emitente_cnpj = ""
    if emit is not None:
        x_nome = find_first(emit, "xNome")
        cnpj = find_first(emit, "CNPJ")
        if x_nome is not None and x_nome.text:
            emitente_nome = x_nome.text.strip()
        if cnpj is not None and cnpj.text:
            emitente_cnpj = cnpj.text.strip()

    # Itens / Produtos (<det>)
    itens: List[Dict[str, Any]] = []
    for elem in root.iter():
        if _remover_namespace(elem.tag) == "det":
            prod = find_first(elem, "prod")
            if prod is not None:
                c_prod = find_first(prod, "cProd")
                x_prod = find_first(prod, "xProd")
                q_com = find_first(prod, "qCom")
                u_com = find_first(prod, "uCom")
                v_un = find_first(prod, "vUnCom")
                v_prod = find_first(prod, "vProd")

                try:
                    qtd = float(q_com.text.strip()) if q_com is not None and q_com.text else 0.0
                except Exception:
                    qtd = 0.0

                try:
                    valor_unit = float(v_un.text.strip()) if v_un is not None and v_un.text else 0.0
                except Exception:
                    valor_unit = 0.0

                itens.append({
                    "codigo": c_prod.text.strip() if c_prod is not None and c_prod.text else "",
                    "descricao": x_prod.text.strip() if x_prod is not None and x_prod.text else "PRODUTO SEM DESCRIÇÃO",
                    "quantidade": qtd,
                    "unidade": u_com.text.strip() if u_com is not None and u_com.text else "UN",
                    "valor_unitario": valor_unit,
                    "valor_total": float(v_prod.text.strip()) if v_prod is not None and v_prod.text else 0.0
                })

    return {
        "numero_nota": numero_nota,
        "data_emissao": data_emissao,
        "fornecedor": emitente_nome,
        "cnpj_fornecedor": emitente_cnpj,
        "total_itens": len(itens),
        "itens": itens
    }


def importar_nfe_para_banco(xml_bytes: bytes, db: Session) -> Dict[str, Any]:
    """
    Processa a NF-e XML e incrementa o saldo de estoque real dos EPIs.
    Se o EPI não existir no sistema, cadastra automaticamente o item.
    """
    dados_nfe = parse_nfe_xml(xml_bytes)
    itens = dados_nfe.get("itens", [])
    
    atualizados = 0
    cadastrados = 0
    detalhes: List[Dict[str, Any]] = []

    for item in itens:
        desc = item["descricao"]
        qtd = item["quantidade"]
        un = item["unidade"]

        # Busca EPI correspondente no banco (busca flexível)
        epi = db.query(EPI).filter(EPI.descricao.ilike(f"%{desc[:30]}%")).first()

        if epi:
            saldo_anterior = epi.estoque_real
            epi.estoque_real = (epi.estoque_real or 0.0) + qtd
            if not epi.fabricante and dados_nfe.get("fornecedor"):
                epi.fabricante = dados_nfe["fornecedor"]
            atualizados += 1
            detalhes.append({
                "descricao": epi.descricao,
                "saldo_anterior": saldo_anterior,
                "quantidade_entrada": qtd,
                "saldo_novo": epi.estoque_real,
                "status": "Estoque incrementado"
            })
        else:
            # Cadastra novo EPI se não encontrado
            novo_epi = EPI(
                descricao=desc,
                fabricante=dados_nfe.get("fornecedor"),
                estoque_real=qtd,
                estoque_minimo=5.0,  # Mínimo padrão
                unidade=un
            )
            db.add(novo_epi)
            cadastrados += 1
            detalhes.append({
                "descricao": desc,
                "saldo_anterior": 0.0,
                "quantidade_entrada": qtd,
                "saldo_novo": qtd,
                "status": "Novo EPI cadastrado com entrada"
            })

    db.commit()

    return {
        "numero_nota": dados_nfe.get("numero_nota"),
        "fornecedor": dados_nfe.get("fornecedor"),
        "data_emissao": dados_nfe.get("data_emissao"),
        "total_itens_processados": len(itens),
        "itens_atualizados": atualizados,
        "itens_novos": cadastrados,
        "detalhes": detalhes,
        "mensagem": f"Nota Fiscal Nº {dados_nfe.get('numero_nota', 'S/N')} processada: {atualizados} itens atualizados e {cadastrados} novos cadastrados."
    }
