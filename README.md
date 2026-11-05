# Amabile Chocolates: plataforma web e catálogo virtual

Projeto de extensão (Programação para Internet, FATEC Tatuí) em parceria com a Amabile Maria Maia Pedroso.

**Tecnologias:** HTML5, CSS3 e JavaScript (sem frameworks), Google Fonts, Git/GitHub, protótipo no Figma.

## Estrutura
- `index.html`: páginas e seções (início, catálogo, nossa história, como encomendar, contato)
- `style.css`: identidade visual e responsividade
- `produtos.js`: dados do catálogo (editar preços, textos e fotos aqui)
- `app.js`: filtro, busca, ordenação, sacola, subtotal e formulário
- `img/`: fotos dos produtos (informar o caminho em `produtos.js`)

## Como rodar
Abra `index.html` no navegador. Não precisa instalar nada.

## Deploy (GitHub Pages)
1. Crie o repositório e envie estes arquivos (`git init`, `git add .`, `git commit`, `git push`).
2. Em *Settings > Pages*, escolha a branch `main` e a pasta `/ (root)`.
3. O link `https://usuario.github.io/repositorio` entra no relatório.

## Como atualizar produtos (manutenção)
Edite `produtos.js`: cada produto tem `nome`, `categoria`, `preco`, `descricao` e `imagem`.

## Limitações da versão 1
Sem pagamento, frete ou estoque. O formulário confirma na tela, mas não envia e-mail: a evolução prevista é integrar ao WhatsApp oficial da empresa.

## Contribuições
Cada integrante commita com o próprio usuário. Veja `git log` e o Diário de bordo do relatório.
