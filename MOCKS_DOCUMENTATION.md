# Plano de Implementação de Mocks para Testes

Este documento descreve as alterações realizadas para permitir o teste completo da aplicação sem a necessidade de uma API externa ativa.

## 1. Criação de Dados Mock (`lib/mock-data.ts`)
Foram criadas estruturas de dados que seguem fielmente as interfaces definidas em `lib/types.ts`. Isso inclui:
- `MOCK_EMBED_RESPONSE`: Resposta simulada para geração de embeddings.
- `MOCK_SIMILARITY_RESPONSE`: Lista de patentes similares para busca textual.
- `MOCK_IMAGES_RESPONSE`: Resultados simulados para busca por imagem.
- `MOCK_CHUNKS_RESPONSE`: Resultados para busca por fragmentos (chunks).

## 2. Interceptação nas Server Actions (`app/_actions/patent-actions.ts`)
As funções de servidor que se comunicam com a API externa foram modificadas para incluir um mecanismo de "toggle":
- Adicionada a constante `USE_MOCKS = true` no topo do arquivo.
- Cada função (`generateEmbeddingsAction`, `searchPatentsByTextAction`, etc.) verifica esta flag antes de realizar a chamada Axios.
- Foram adicionados delays artificiais (`setTimeout`) variando entre 500ms e 1000ms para simular a latência real de rede e permitir testar os estados de carregamento (loading) da interface.

## 3. Cobertura de Funcionalidades
- **Busca por Texto**: Retorna patentes simuladas.
- **Busca por Imagem**: Retorna caminhos de imagens mock (utilizando placeholders).
- **Análise com IA**: A função `analyzePatent` em `lib/api.ts` já operava em modo mock e foi mantida para consistência.

## Como Alternar entre Mock e Real
Para voltar a usar a API real, basta alterar a constante no arquivo de ações:
```typescript
// app/_actions/patent-actions.ts
const USE_MOCKS = false // Alterar para false para usar a API real
```

## Próximos Passos Sugeridos
- Implementar mocks para o chat (perguntas e respostas sobre o resultado).
- Adicionar suporte a erros randômicos nos mocks para testar a resiliência da UI.
