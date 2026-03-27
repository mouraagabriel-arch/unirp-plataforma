// Módulo de Integração com Google Gemini
import { supabase } from './supabase-client.js';

export const gemini = {
    async generateContent(prompt, instituicaoId) {
        // 1. Busca o "Cérebro Institucional" (Contexto)
        const { data: inst, error } = await supabase
            .from('settings')
            .select('gemini_key, tom_de_voz, missao, visao, valores, historico')
            .eq('id', instituicaoId)
            .single();

        if (error || !inst.gemini_key) {
            throw new Error("Chave Gemini não configurada no Cérebro Institucional.");
        }

        // 2. Constrói o System Prompt com a essência da marca
        const systemPrompt = `
            Você é o Assessor de RP da instituição: ${inst.nome}.
            Tom de Voz: ${inst.tom_de_voz || 'Profissional e Estratégico'}
            Missão: ${inst.missao || ''}
            Visão: ${inst.visao || ''}
            Valores: ${inst.valores || ''}
            Histórico: ${inst.historico || ''}
            
            Sempre responda mantendo a identidade da marca acima.
        `;

        const fullPrompt = `${systemPrompt}\n\nSolicitação: ${prompt}`;

        // 3. Chamada para a API do Gemini
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${inst.gemini_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }]
                })
            });

            const result = await response.json();
            
            if (result.error) throw new Error(result.error.message);
            
            return result?.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao processar resposta da IA.";
        } catch (error) {
            console.error("Erro na IA:", error);
            throw error;
        }
    }
};
