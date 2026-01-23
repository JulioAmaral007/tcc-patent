'use server'

import { createClient } from "@/lib/supabase-server";
import { GoogleGenAI } from "@google/genai";

/**
 * Server Action refactorada para nomes em inglês e novo schema do Supabase.
 */
export async function processarChatComIAAction(
  conversationId: string,
  userMessage: string,
  apiContext: string
) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || ""
  });
  
  const supabase = await createClient();

  try {
    // 1. Garantir a Conversa (Upsert no context)
    const { error: convError } = await supabase
      .from('conversations')
      .upsert({ 
        id: conversationId, 
        api_context: apiContext,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (convError) throw new Error(`Error managing conversation: ${convError.message}`);

    // 2. Salvar mensagem do usuário
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage
      });

    if (userMsgError) throw new Error(`Error saving user message: ${userMsgError.message}`);

    // 3. Buscar histórico recente
    const { data: history, error: histError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (histError) console.error("Error fetching history:", histError);

    // 4. Preparar conteúdo para o Gemini
    const instruction = `Use this context to answer the user: ${apiContext}. 
    Be a technical expert in patents. Be direct and concise.`;

    const contents = [
      { role: 'user', parts: [{ text: instruction }] },
      { role: 'model', parts: [{ text: "Understood. I will use the provided patent context to answer your questions accurately." }] },
      ...(history || [])
        .filter(m => m.content !== userMessage) // Evita duplicar a mensagem atual
        .map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.content }]
        })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    // 5. Chamada da API usando o novo padrão do SDK @google/genai
    // Note: Usando gemini-2.0-flash experimental conforme preferência observada
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: contents,
    });

    const responseText = response.text || "";

    // 6. Salvar resposta da IA
    const { error: modelMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'model',
        content: responseText
      });

    if (modelMsgError) console.error("Error saving model message:", modelMsgError);

    return responseText;

  } catch (error: any) {
    console.error("[Chat Action] Critical Error:", error);
    throw new Error(error.message || "Internal error processing chat.");
  }
}

/**
 * Busca todas as mensagens de uma conversa específica.
 */
export async function buscarMensagensAction(conversationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map(m => ({
    id: m.id,
    role: m.role === 'model' ? 'assistant' : m.role, // Mapeia model -> assistant para o componente
    content: m.content,
    timestamp: new Date(m.created_at).getTime()
  }));
}
