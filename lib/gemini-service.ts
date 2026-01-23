import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";

/**
 * Serviço de Integração Gemini com Memória (Versão Novo SDK)
 */
export async function processarChatComIA(
  idDaConversa: string,
  mensagemDoUsuario: string,
  dadosBrutosDaAPI: any
) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  });
  
  const { data: mensagensExistentes } = await supabase
    .from('mensagens')
    .select('role, conteudo, criado_em')
    .eq('conversa_id', idDaConversa)
    .order('criado_em', { ascending: true })
    .limit(10);

  const instruction = `Você é um assistente especialista. Analise estes dados: ${JSON.stringify(dadosBrutosDaAPI)}. Responda apenas com base neles.`;

  const contents = [
    { role: 'user', parts: [{ text: instruction }] },
    { role: 'model', parts: [{ text: "Entendido." }] },
    ...(mensagensExistentes || []).map(m => ({
      role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model',
      parts: [{ text: m.conteudo }]
    })),
    { role: 'user', parts: [{ text: mensagemDoUsuario }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: contents,
    });

    const text = response.text;

    await supabase
      .from('mensagens')
      .insert([
        { conversa_id: idDaConversa, role: 'user', conteudo: mensagemDoUsuario },
        { conversa_id: idDaConversa, role: 'model', conteudo: text }
      ]);

    return text;
  } catch (error: any) {
    console.error("Erro Gemini:", error);
    if (error.message?.includes("429") || error.status === 429 || error.message?.includes("quota")) {
      throw new Error("Limite de uso da API atingido (Quota Exceeded). Por favor, aguarde alguns segundos.");
    }
    throw error;
  }
}
