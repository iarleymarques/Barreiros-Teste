try:
    from num2words import num2words
except ImportError:
    num2words = None

def numero_por_extenso(valor: float) -> str:
    if num2words:
        try:
            val_ext = num2words(valor, lang='pt_BR', to='currency')
            # Formata primeira letra maiúscula
            return val_ext.capitalize()
        except Exception:
            pass

    # Fallback customizado
    inteiros = int(valor)
    unidades = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove']
    especiais = ['Dez', 'Onze', 'Doze', 'Treze', 'Quatorze', 'Quinze', 'Dezesseis', 'Dezessete', 'Dezoito', 'Dezenove']
    dezenas = ['', 'Dez', 'Vinte', 'Trinta', 'Quarenta', 'Cinquenta', 'Sessenta', 'Setenta', 'Oitenta', 'Noventa']
    centenas = ['', 'Cento', 'Duzentos', 'Trezentos', 'Quatrocentos', 'Quinhentos', 'Seiscentos', 'Setecentos', 'Oitocentos', 'Novecentos']

    if inteiros == 0:
        return 'Zero Reais'
    if inteiros == 100:
        return 'Cem Reais'

    extenso = ''
    if inteiros >= 1000:
        mil = inteiros // 1000
        resto_mil = inteiros % 1000
        extenso += 'Mil' if mil == 1 else f"{unidades[mil]} Mil"
        if resto_mil > 0:
            extenso += ' e '

    c = (inteiros % 1000) // 100
    resto_c = inteiros % 100

    if c > 0:
        extenso += centenas[c]
        if resto_c > 0:
            extenso += ' e '

    if 10 <= resto_c <= 19:
        extenso += especiais[resto_c - 10]
    elif resto_c > 0:
        d = resto_c // 10
        u = resto_c % 10
        if d > 0:
            extenso += dezenas[d]
            if u > 0:
                extenso += ' e '
        if u > 0:
            extenso += unidades[u]

    res = extenso.strip() + (' Real' if inteiros == 1 else ' Reais')
    return res
