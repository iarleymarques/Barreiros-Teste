import uuid
from datetime import datetime
from app.core.database import SessionLocal
from app.core.encryption import encrypt_val
from app.models.diarista import DiaristaLancamento

# Lista de 25 profissionais diaristas com dados e datas úteis em Setembro de 2026
# OBS: Nenhum sábado (05, 12, 19, 26) e nenhum domingo (06, 13, 20, 27)
DADOS_DIARISTAS = [
    {
        "nome": "CARLOS EDUARDO SILVA SANTOS",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-01",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "845.123.789-01",
        "pago": True,
        "observacoes": "Descarregamento carreta Ambev"
    },
    {
        "nome": "FRANCISCO WELLINGTON LIMA",
        "profissao": "Operador de Empilhadeira",
        "data": "2026-09-02",
        "valor_diaria": 160.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 99876-5432",
        "pago": True,
        "observacoes": "Organização do estoque A e pallets"
    },
    {
        "nome": "ANTONIO MARCOS PEREIRA",
        "profissao": "Motorista Entregador",
        "data": "2026-09-03",
        "valor_diaria": 180.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "654.987.321-44",
        "pago": True,
        "observacoes": "Rota de entrega Centro e Aldeota"
    },
    {
        "nome": "MARIA CLARA DOS SANTOS",
        "profissao": "Auxiliar de Limpeza e Conservação",
        "data": "2026-09-04",
        "valor_diaria": 100.00,
        "quantidade_diarias": 1,
        "tipo_pix": "email",
        "chave_pix": "maria.clara.diarista@gmail.com",
        "pago": True,
        "observacoes": "Higienização completa do galpão principal"
    },
    {
        "nome": "RAIMUNDO NONATO FERREIRA",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-07",
        "valor_diaria": 130.00,
        
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "321.654.987-12",
        "pago": True,
        "observacoes": "Plantão feriado separação de caixas"
    },
    {
        "nome": "JOSE ROBERTO DE SOUZA",
        "profissao": "Conferente de Mercadorias",
        "data": "2026-09-08",
        "valor_diaria": 150.00,
        "quantidade_diarias": 1,
        "tipo_pix": "chave_aleatoria",
        "chave_pix": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "pago": True,
        "observacoes": "Conferência notas fiscais de entrada"
    },
    {
        "nome": "LUCAS MENDES BARBOSA",
        "profissao": "Separador de Pedidos",
        "data": "2026-09-09",
        "valor_diaria": 110.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 98765-4321",
        "pago": True,
        "observacoes": "Separação de engradados de cerveja"
    },
    {
        "nome": "PAULO HENRIQUE ALMEIDA",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-10",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "123.456.789-99",
        "pago": True,
        "observacoes": "Carregamento caminhão 04"
    },
    {
        "nome": "GABRIEL RODRIGUES DE OLIVEIRA",
        "profissao": "Auxiliar de Estoque",
        "data": "2026-09-11",
        "valor_diaria": 115.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "789.123.456-55",
        "pago": True,
        "observacoes": "Inventário semanal de refrigerantes"
    },
    {
        "nome": "TIAGO COSTA CAVALCANTE",
        "profissao": "Motorista Entregador",
        "data": "2026-09-14",
        "valor_diaria": 180.00,
        "quantidade_diarias": 1,
        "tipo_pix": "email",
        "chave_pix": "tiago.costa.entregas@outlook.com",
        "pago": True,
        "observacoes": "Rota Metropolitana - Caucaia / Maracanaú"
    },
    {
        "nome": "ANDERSON FELIPE GOMES",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-15",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 99123-4567",
        "pago": True,
        "observacoes": "Descarregamento água mineral e gelo"
    },
    {
        "nome": "MATHEUS DA SILVA PINHEIRO",
        "profissao": "Operador de Empilhadeira",
        "data": "2026-09-16",
        "valor_diaria": 160.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "456.789.123-88",
        "pago": True,
        "observacoes": "Movimentação câmara fria"
    },
    {
        "nome": "BRUNO HENRIQUE SOARES",
        "profissao": "Separador de Pedidos",
        "data": "2026-09-17",
        "valor_diaria": 110.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "333.444.555-66",
        "pago": False,
        "observacoes": "Separação de packs lata 350ml"
    },
    {
        "nome": "FERNANDO BEZERRA LOPES",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-18",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 98877-6655",
        "pago": False,
        "observacoes": "Carregamento caminhão 02"
    },
    {
        "nome": "DIEGO MARTINS FREITAS",
        "profissao": "Conferente de Mercadorias",
        "data": "2026-09-21",
        "valor_diaria": 150.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "777.888.999-00",
        "pago": False,
        "observacoes": "Conferência de carga devolvida"
    },
    {
        "nome": "RODRIGO NASCIMENTO VIEIRA",
        "profissao": "Motorista Entregador",
        "data": "2026-09-22",
        "valor_diaria": 180.00,
        "quantidade_diarias": 1,
        "tipo_pix": "email",
        "chave_pix": "rodrigo.entregas.ce@gmail.com",
        "pago": False,
        "observacoes": "Entregas expressas atacado"
    },
    {
        "nome": "LEANDRO MOURA BARROS",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-23",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "222.333.444-55",
        "pago": False,
        "observacoes": "Descarga de chopp barril 50L"
    },
    {
        "nome": "ALEXANDRE TEIXEIRA LUZ",
        "profissao": "Auxiliar de Estoque",
        "data": "2026-09-24",
        "valor_diaria": 115.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 99444-3322",
        "pago": False,
        "observacoes": "Remanejamento de garrafeiras"
    },
    {
        "nome": "JOAO VITOR MONTEIRO",
        "profissao": "Separador de Pedidos",
        "data": "2026-09-25",
        "valor_diaria": 110.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "555.666.777-88",
        "pago": False,
        "observacoes": "Expedição turno da tarde"
    },
    {
        "nome": "WESLEY GABRIEL RIBEIRO",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-28",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "chave_aleatoria",
        "chave_pix": "f9e8d7c6-b5a4-3210-9876-543210fedcba",
        "pago": False,
        "observacoes": "Carga de refrigerantes 2L Pet"
    },
    {
        "nome": "SAMUEL CARDOSO DIAS",
        "profissao": "Operador de Empilhadeira",
        "data": "2026-09-29",
        "valor_diaria": 160.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "888.999.000-11",
        "pago": False,
        "observacoes": "Organização do depósito B"
    },
    {
        "nome": "FABIO JUNIOR ANDRADE",
        "profissao": "Motorista Entregador",
        "data": "2026-09-30",
        "valor_diaria": 180.00,
        "quantidade_diarias": 1,
        "tipo_pix": "email",
        "chave_pix": "fabio.junior.logistica@gmail.com",
        "pago": False,
        "observacoes": "Fechamento de rotas de final de mês"
    },
    # Inclusão de repetições de dias para demonstrar consolidação
    {
        "nome": "CARLOS EDUARDO SILVA SANTOS",
        "profissao": "Ajudante de Carga / Descarga",
        "data": "2026-09-15",
        "valor_diaria": 120.00,
        "quantidade_diarias": 1,
        "tipo_pix": "cpf",
        "chave_pix": "845.123.789-01",
        "pago": True,
        "observacoes": "Segunda diária do mês - Apoio descarga"
    },
    {
        "nome": "FRANCISCO WELLINGTON LIMA",
        "profissao": "Operador de Empilhadeira",
        "data": "2026-09-22",
        "valor_diaria": 160.00,
        "quantidade_diarias": 1,
        "tipo_pix": "telefone",
        "chave_pix": "(85) 99876-5432",
        "pago": False,
        "observacoes": "Segunda diária do mês - Empilhamento pallets"
    }
]

def main():
    db = SessionLocal()
    try:
        inseridos = 0
        for item in DADOS_DIARISTAS:
            # Verifica se já existe um lançamento com mesmo nome e data
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
        print(f"Sucesso! {inseridos} diaristas inseridos no banco de dados para Setembro de 2026.")
        
        # Exibe estatísticas do mês de setembro
        total_setembro = db.query(DiaristaLancamento).filter(
            DiaristaLancamento.data.startswith("2026-09")
        ).count()
        print(f"Total de lançamentos em Setembro de 2026 agora: {total_setembro}")
    except Exception as e:
        db.rollback()
        print(f"Erro ao inserir diaristas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
