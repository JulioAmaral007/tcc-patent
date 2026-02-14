'use server'

import { createClient } from '@/lib/supabase-server'
import { GoogleGenAI } from '@google/genai'

/**
 * Server Action refactored for English names and new Supabase schema.
 */
export async function processChatWithAIAction(
  conversationId: string,
  userMessage: string,
  apiContext: string,
) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
  })

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  try {
    // 1. Garantir a Conversa
    const { error: convError } = await supabase.from('conversations').upsert(
      {
        id: conversationId,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

    if (convError)
      throw new Error(`Error managing conversation: ${convError.message}`)

    // Check if system message already exists for context
    const { data: existingSystemMsg } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('role', 'system')
      .single()

    if (!existingSystemMsg && apiContext) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'system',
        content: apiContext,
      })
    }

    // 2. Salvar mensagem do usuário
    const { error: userMsgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
    })

    if (userMsgError)
      throw new Error(`Error saving user message: ${userMsgError.message}`)

    // 3. Buscar histórico recente
    const { data: history, error: histError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    if (histError) console.error('Error fetching history:', histError)

    console.log(apiContext)

    // 4. Preparar conteúdo para o Gemini
    const instruction = `You are a technical and legal expert in patents. Use ONLY the following context to answer the user. Do not invent data outside this context.

CONTEXT:
${apiContext}

YOUR ROLE:
- Answer questions clearly, directly and concisely, based on the context above.
- When asked about ANTERIORIDADE (prior art / novelty): help analyze whether the invention or claims may be affected by prior disclosures, existing patents or publications; point out overlaps, differences and potential risks to novelty or inventive step; indicate which prior art in the context is most relevant.
- When asked about PREVENÇÃO DE LITÍGIO (litigation prevention / freedom to operate): help identify potential infringement risks, conflicting claims or blocking patents; suggest how to differentiate the invention or narrow claims to reduce litigation risk; highlight areas that may require further clearance or legal advice.
- If the context does not contain enough information to answer, say so and suggest what additional documents or searches would help.
- Do not give definitive legal advice; recommend consulting a patent attorney for formal opinions and litigation strategy.`

    const contents = [
      { role: 'user', parts: [{ text: instruction }] },
      {
        role: 'model',
        parts: [
          {
            text: 'Understood. I will use the provided patent context to answer your questions accurately.',
          },
        ],
      },
      ...(history || [])
        .filter((m) => m.content !== userMessage && m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      { role: 'user', parts: [{ text: userMessage }] },
    ]

    // 5. Chamada da API (SDK @google/genai)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: contents,
    })

    const responseText = response.text || ''

    // 6. Salvar resposta da IA
    const { error: modelMsgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: responseText,
    })

    if (modelMsgError)
      console.error('Error saving model message:', modelMsgError)

    return responseText
  } catch (error: unknown) {
    console.error('[Chat Action] Critical Error:', error)
    const message =
      error instanceof Error ? error.message : 'Internal error processing chat.'
    throw new Error(message)
  }
}

/**
 * Fetches all messages from a specific conversation.
 */
export async function fetchMessagesAction(conversationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data
    .filter((m) => m.role !== 'system') // Não mostrar mensagens de sistema na UI
    .map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at).getTime(),
    }))
}
