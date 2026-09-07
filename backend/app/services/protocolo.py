import random
from datetime import datetime

def gerar_protocolo() -> str:
    ano = datetime.now().year
    rand_num = random.randint(100000, 999999)
    return f"IB-{ano}-{rand_num}"

def gerar_numero_recibo() -> str:
    ano = datetime.now().year
    rand_num = random.randint(10000, 99999)
    return f"REC-{ano}-{rand_num}"
