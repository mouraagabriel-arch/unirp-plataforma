import { FormEvent, useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-8 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-black">Acesso à Plataforma</h1>
          <p className="text-sm text-slate-400 mt-1">Login seguro com roteamento automático por tenant.</p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">E-mail</span>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Mail className="w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="voce@instituicao.gov.br"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Senha</span>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="********"
            />
          </div>
        </label>

        {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-accent text-white font-black py-3 hover:bg-brand-accent/90 disabled:opacity-70"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
