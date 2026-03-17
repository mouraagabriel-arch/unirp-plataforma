/**
 * Mock do Supabase Client para o módulo Gemini
 */
export const supabase = window.supabase || {
    from: () => ({
        select: () => ({
            eq: () => ({
                single: () => Promise.resolve({ data: {}, error: null })
            })
        })
    })
};
