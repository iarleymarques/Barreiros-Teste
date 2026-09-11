# 🔄 Guia de Migração de Repositório GitHub

## Objetivo
Migrar o projeto **SITE - IRMÃOS BARREIROS** para um novo repositório em outra conta GitHub.

---

## Passo a Passo

### 1. Criar o novo repositório na outra conta GitHub

1. Acesse [github.com](https://github.com) e faça login na **nova conta**
2. Clique em **"New repository"** (botão verde no canto superior)
3. Defina o nome do repositório (ex: `site-irmaos-barreiros`)
4. Escolha se será **público** ou **privado**
5. **NÃO** marque "Add a README" nem ".gitignore" (o projeto já tem tudo)
6. Clique em **"Create repository"**
7. Copie a URL do novo repositório (ex: `https://github.com/nova-conta/site-irmaos-barreiros.git`)

---

### 2. Alterar o remote do projeto local

Abra o terminal na pasta do projeto e execute:

```bash
# Ver o remote atual
git remote -v

# Remover o remote antigo
git remote remove origin

# Adicionar o novo remote (substitua pela URL do novo repositório)
git remote add origin https://github.com/NOVA-CONTA/NOME-DO-REPO.git

# Verificar se o novo remote foi configurado corretamente
git remote -v
```

---

### 3. Enviar o projeto para o novo repositório

```bash
# Enviar todos os branches e tags para o novo repositório
git push -u origin main
```

> [!NOTE]
> Se o branch principal for `master` em vez de `main`, use:
> ```bash
> git push -u origin master
> ```

Para enviar **todos** os branches e tags:

```bash
git push origin --all
git push origin --tags
```

---

### 4. Autenticação na nova conta

Ao fazer o push, o Git vai pedir as credenciais da nova conta. Você tem duas opções:

#### Opção A: Token de Acesso Pessoal (Recomendado)
1. Na nova conta GitHub, vá em **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Gere um novo token com permissão de **repo**
3. Use o token como senha quando o Git pedir

#### Opção B: SSH Key
1. Gere uma nova chave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
   ```
2. Adicione a chave pública na nova conta GitHub em **Settings → SSH and GPG keys**
3. Use a URL SSH no remote:
   ```bash
   git remote set-url origin git@github.com:NOVA-CONTA/NOME-DO-REPO.git
   ```

---

### 5. (Opcional) Remover o repositório antigo

Após confirmar que tudo está funcionando no novo repositório:

1. Acesse o repositório antigo no GitHub
2. Vá em **Settings → Danger Zone → Delete this repository**

> [!CAUTION]
> Só delete o repositório antigo **depois** de confirmar que todo o código, branches e histórico estão corretos no novo repositório.

---

## ✅ Checklist Final

- [ ] Novo repositório criado na outra conta
- [ ] Remote local atualizado para o novo repositório
- [ ] Push realizado com sucesso
- [ ] Todos os branches e tags enviados
- [ ] Verificar no GitHub se os arquivos estão corretos
- [ ] (Opcional) Repositório antigo removido

---

> [!TIP]
> Todo o histórico de commits será preservado na migração. Nenhum código será perdido.