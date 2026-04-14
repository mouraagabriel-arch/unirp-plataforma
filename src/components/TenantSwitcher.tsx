import type { ChangeEvent } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

interface TenantSwitcherProps {
  className?: string;
}

export function TenantSwitcher({ className }: TenantSwitcherProps) {
  const { profile, availableTenants, activeTenantId, setActiveTenant } = useAuthContext();

  if (!profile || profile.role !== 'super_admin' || availableTenants.length === 0) {
    return null;
  }

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await setActiveTenant(event.target.value);
  };

  return (
    <label className={className ?? 'flex items-center gap-3 text-xs uppercase tracking-wider text-slate-300'}>
      Tenant ativo
      <select
        value={activeTenantId ?? ''}
        onChange={handleChange}
        className="bg-slate-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-slate-100 outline-none"
      >
        {availableTenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id} className="text-slate-100 bg-slate-900">
            {tenant.nome} ({tenant.tipo_modulo})
          </option>
        ))}
      </select>
    </label>
  );
}
