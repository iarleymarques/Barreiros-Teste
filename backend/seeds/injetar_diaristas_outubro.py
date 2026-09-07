import uuid
from datetime import datetime
from app.core.database import SessionLocal
from app.core.encryption import encrypt_val
from app.models.diarista import DiaristaLancamento

# Lista de 10 diaristas para 04/10/2026
DIARISTAS_OUTUBRO = [
    {
        "nome": "CARLOS EDUARDO SILVA SANTOS",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-10-04",
        "valor_diaria": 130.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "845.123.789-01",
        "pago": True,
        "observacoes": "Descarregamento de carretas no galpão principal"
    },
    {
        "nome": "FRANCISCO WELLINGTON LIMA",
        "profissao": "Operador de Empilhadeira",
        "data": "2026-10-04",
        "valor_diaria": 170.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 99876-5432",
        "pago": True,
        "observacoes": "Movimentação e empilhamento de pallets pesados"
    },
    {
        "nome": "ANTONIO MARCOS PEREIRA",
        "profissao": "Motorista Entregador",
        "data": "2026-10-04",
        "valor_diaria": 190.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "654.987.321-44",
        "pago": True,
        "observacoes": "Entregas especiais na região metropolitana"
    },
    {
        "nome": "MARIA CLARA DOS SANTOS",
        "profissao": "Auxiliar de Limpeza e Conservação",
        "data": "2026-10-04",
        "valor_diaria": 110.00,
        "quantidade_diarias": 1,
        "tipo_pix": "email",
        "chave_pix": "maria.clara.diarista@gmail.com",
        "pago": True,
        "observacoes": "Higienização completa dos setores de expedição"
    },
    {
        "nome": "RAIMUNDO NONATO FERREIRA",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-10-04",
        "valor_diaria": 130.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "321.654.987-12",
        "pago": True,
        "observacoes": "Triagem e carregamento de fardos"
    },
    {
        "nome": "JOSE ROBERTO DE SOUZA",
        "profissao": "Conferente de Mercadorias",
        "data": "2026-10-04",
        "valor_diaria": 160.00,
        "quantidade_diarias": 1,
        "tipo_pix": "chave_aleatoria",
        "chave_pix": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "pago": True,
        "observacoes": "Conferência e checagem de notas fiscais"
    },
    {
        "nome": "LUCAS MENDES BARBOSA",
        "profissao": "Separador de Pedidos",
        "data": "2026-10-04",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 98765-4321",
        "pago": True,
        "observacoes": "Montagem e separação de pedidos para expedição"
    },
    {
        "nome": "PAULO HENRIQUE ALMEIDA",
        "profissao": "Ajudante Geral",
        "data": "2026-10-04",
        "valor_diaria": 125.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "123.456.789-99",
        "pago": True,
        "observacoes": "Apoio nas rotinas operacionais do pátio"
    },
    {
        "nome": "GABRIEL RODRIGUES DE OLIVEIRA",
        "profissao": "Auxiliar de Estoque",
        "data": "2026-10-04",
        "valor_diaria": 135.00,
        "quantidade_diarias": 1,
        "tipo_pix": "email",
        "chave_pix": "gabriel.estoque.op@gmail.com",
        "pago": True,
        "observacoes": "Inventário rotativo e contagem física de caixas"
    },
    {
        "nome": "TIAGO COSTA PINHEIRO",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-10-04",
        "valor_diaria": 130.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "987.654.321-00",
        "pago": True,
        "observacoes": "Descarregamento de insumos e estocagem"
    }
]

def main():
    db = SessionLocal()
    try:
        inseridos = 0
        for item in DIARISTAS_OUTUBRO:
            existente = db.query(DiaristaLancamento).filter(
                DiaristaLancamento.nome == item["nome"],
                DiaristaLancamento.data == item["data"]
            ).first()

            if not existente:
                chave_criptografada = encrypt_val(item["chave_pix"])
                v_total = float(item["valor_diaria"]) * int(item["quantidade_diarias"])

                novo = DiaristaLancamento(
                    id=str(uuid.uuid4()),
                    nome=item["nome"],
                    profissao=item["profissao"],
                    data=item["data"],
                    valor_diaria=item["valor_diaria"],
                    quantidade_diarias=item["quantidade_diarias"],
                    valor_total=v_total,
                    tipo_pix=item["tipo_pix"],
                    chave_pix=chave_criptografada,
                    observacoes=item["observacoes"],
                    pago=item["pago"],
                    created_at=datetime.utcnow()
                )
                db.add(novo)
                inseridos += 1

        db.commit()
        print(f"Sucesso! {inseridos} diaristas inseridos no dia 04/10/2026.")

        total_dia = db.query(DiaristaLancamento).filter(
            DiaristaLancamento.data == "2026-10-04"
        ).count()
        print(f"Total de lançamentos para 04/10/2026: {total_dia}")

    except Exception as e:
        db.rollback()
        print(f"Erro ao inserir diaristas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
