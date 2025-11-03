import { useState, useEffect } from 'react';
import { DepositoService } from '../../deposito/services/deposito.service';
import type { Deposito } from '../../deposito/types/deposito.types';

export function useDepositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void (async () => {
      try {
        const data = await DepositoService.getAll();
        if (mounted) setDepositos(data || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Error cargando depósitos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { depositos, loading, error };
}
