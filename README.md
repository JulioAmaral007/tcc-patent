# Patent Analyzer

Uma aplicação web moderna para análise de patentes. Permite realizar análises inteligentes de documentos de patentes.

## 🚀 Funcionalidades

- **Análise de Patentes**: Processamento inteligente de textos de patentes
- **Interface Moderna**: Design responsivo com suporte a tema claro/escuro
- **Upload de Arquivos**: Suporte para busca por imagens
- **Entrada de Texto**: Digitação ou colagem manual de texto
- **Estatísticas em Tempo Real**: Contagem de palavras, caracteres e parágrafos
- **Feedback Visual**: Barras de progresso e notificações para acompanhar o processamento

## 🛠️ Tecnologias

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização
- **[PDF.js](https://mozilla.github.io/pdf.js/)** - Processamento de PDFs
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Sonner](https://sonner.emilkowal.ski/)** - Notificações toast
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Gerenciamento de temas

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd tcc-patent
```

1. Instale as dependências:

```bash
npm install
```

1. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

1. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 🎯 Como Usar

### Análise por Texto

1. Na aba **Texto**, cole ou digite o texto da patente
2. Clique em **Analisar Patente**
3. Visualize os resultados no painel direito

### Análise por Upload

1. Na aba **Upload**, arraste e solte ou selecione uma imagem
2. Clique em **Pesquisar por Imagem** para processar
3. Visualize os resultados no painel direito

### Formatos Suportados

- **Imagens**: PNG, JPEG, JPG, WebP
- **Documentos**: PDF

## 🏗️ Estrutura do Projeto

```text
tcc-patent/
├── app/                          # App Router do Next.js
│   ├── _actions/                 # Server Actions (lado do servidor)
│   │   └── patent-actions.ts 
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página inicial
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                       # Componentes de UI (Radix UI)
│   └── ...                       # Outros componentes
├── lib/                          # Utilitários e lógica
│   ├── patent-api-utils.ts       # Configuração Axios (lado do servidor)
│   ├── api.ts                    # Wrapper de API (lado do cliente)
│   ├── types.ts                  # Tipos TypeScript
│   └── utils.ts                  # Funções utilitárias
├── docs/                         # Documentação
│   └── ENV_SETUP.md              # Configuração de variáveis de ambiente
└── public/                       # Arquivos estáticos
```

## 🔌 Arquitetura de API

A aplicação utiliza **Server Actions** do Next.js para garantir que todas as chamadas a APIs externas sejam feitas exclusivamente no lado do servidor.

### Fluxo de Comunicação

```
Frontend (Browser)
       │
       ▼
  Server Actions    ◄──── app/_actions/patent-actions.ts ('use server')
       │
       ▼
  API Externa       ◄──── http://212.85.22.109:8001
```

### Benefícios desta Arquitetura

✅ **Segurança**: O `PATENT_API_TOKEN` e a URL da API externa nunca são expostos ao navegador.  
✅ **Simplicidade**: Sem necessidade de gerenciar múltiplas API Routes e endpoints HTTP internos.  
✅ **Performance**: Menos overhead de rede entre o frontend e as funções de backend.  
✅ **Tipagem**: Tipagem completa de ponta a ponta entre o cliente e o servidor.  

### Padrão de Resposta

Todas as API Routes retornam respostas padronizadas:

```json
// Sucesso
{ "success": true, "data": {...} }

// Erro
{ "success": false, "error": "mensagem de erro" }
```

### Configuração

Para configurar as credenciais da API externa, consulte [docs/ENV_SETUP.md](docs/ENV_SETUP.md).

## 🎨 Personalização

### Temas

A aplicação suporta tema claro e escuro, que pode ser alternado através do botão no header. O tema é gerenciado pelo `next-themes` e respeita as preferências do sistema.

### Estilos

Os estilos são definidos usando Tailwind CSS. As cores e variáveis de tema podem ser personalizadas em `app/globals.css`.

## 🔒 Privacidade

- A análise de patentes pode ser configurada para usar uma API externa (conforme configuração)

### Erro ao processar arquivo

- Verifique o tamanho do arquivo (arquivos muito grandes podem causar problemas)
- Tente converter a imagem para um formato mais simples (PNG ou JPEG)

## 📝 Licença

Este projeto é privado e destinado a uso acadêmico (TCC).

## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC).

---
