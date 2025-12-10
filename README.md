# Patent Analyzer

Uma aplicação web moderna para análise de patentes com suporte a OCR (Reconhecimento Óptico de Caracteres) integrado. Permite extrair texto de imagens e PDFs e realizar análises inteligentes de documentos de patentes.

## 🚀 Funcionalidades

- **Análise de Patentes**: Processamento inteligente de textos de patentes
- **OCR Integrado**: Extração de texto de imagens (PNG, JPEG, WebP) e PDFs
- **Interface Moderna**: Design responsivo com suporte a tema claro/escuro
- **Upload de Arquivos**: Suporte para upload de imagens e documentos PDF
- **Entrada de Texto**: Digitação ou colagem manual de texto
- **Estatísticas em Tempo Real**: Contagem de palavras, caracteres e parágrafos
- **Processamento Local**: OCR executado diretamente no navegador (privacidade garantida)
- **Feedback Visual**: Barras de progresso e notificações para acompanhar o processamento

## 🛠️ Tecnologias

- **[Next.js 16](https://nextjs.org/)** - Framework React com App Router
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** - OCR para imagens
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

1. Na aba **Upload**, arraste e solte ou selecione um arquivo (imagem ou PDF)
2. Clique em **Extrair Texto (OCR)** para processar o arquivo
3. O texto extraído será adicionado automaticamente ao campo de texto
4. Clique em **Analisar Patente** para processar

### Formatos Suportados

- **Imagens**: PNG, JPEG, JPG, WebP
- **Documentos**: PDF

## 🏗️ Estrutura do Projeto

```text
tcc-patent/
├── app/                    # App Router do Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (Radix UI)
│   ├── ErrorBox.tsx      # Componente de erro
│   ├── ImagePreview.tsx  # Preview de imagens
│   ├── LoadingSpinner.tsx # Spinner de carregamento
│   ├── ProcessingProgress.tsx # Barra de progresso
│   ├── ResultViewer.tsx  # Visualizador de resultados
│   ├── TextInputArea.tsx # Área de entrada de texto
│   ├── ThemeToggle.tsx   # Toggle de tema
│   └── UploadArea.tsx    # Área de upload
├── lib/                  # Utilitários e lógica
│   ├── api.ts           # Integração com API
│   ├── ocr.ts           # Lógica de OCR
│   └── utils.ts         # Funções utilitárias
└── public/              # Arquivos estáticos
```

## 🔌 Integração com API

A aplicação está preparada para integração com uma API de análise de patentes. Atualmente, a função `analyzePatent` em `lib/api.ts` retorna uma resposta mockada.

Para conectar com sua API:

1. Edite o arquivo `lib/api.ts`
2. Descomente o código da chamada real à API
3. Configure a URL da API na constante `API_URL`
4. Ajuste os headers e formato da requisição conforme necessário

Exemplo:

```typescript
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text }),
});
```

## 🎨 Personalização

### Temas

A aplicação suporta tema claro e escuro, que pode ser alternado através do botão no header. O tema é gerenciado pelo `next-themes` e respeita as preferências do sistema.

### Estilos

Os estilos são definidos usando Tailwind CSS. As cores e variáveis de tema podem ser personalizadas em `app/globals.css`.

## 🔒 Privacidade

- O processamento OCR é executado **localmente no navegador** usando Tesseract.js
- Nenhum dado é enviado para servidores externos durante a extração de texto
- A análise de patentes pode ser configurada para usar uma API externa (conforme configuração)

## 🐛 Solução de Problemas

### OCR não funciona

- Certifique-se de que está usando um navegador moderno (Chrome, Firefox, Edge)
- Verifique se o arquivo está em um formato suportado
- Para PDFs, certifique-se de que o documento contém texto selecionável (não apenas imagens)

### Erro ao processar arquivo

- Verifique o tamanho do arquivo (arquivos muito grandes podem causar problemas)
- Tente converter a imagem para um formato mais simples (PNG ou JPEG)

## 📝 Licença

Este projeto é privado e destinado a uso acadêmico (TCC).

## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC).

---
