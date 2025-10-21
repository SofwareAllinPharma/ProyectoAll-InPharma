import { useEffect, useState } from 'react';
import SearchSelect from '../../../../components/ui/SearchSelect';
import type { Formula } from '../../../formulas/types/formula.types';
import { FormulaService } from '../../../formulas/services/formula.service';

type Props = {
  value: Formula | null;
  onChange: (f: Formula) => void;
  className?: string;
  noResultsText?: string;
};

export default function FormulaSearchSelect({ value, onChange, className, noResultsText }: Props) {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await FormulaService.getAllFormulas();
        if (!mounted) return;
        setFormulas(data.filter(f => f.insumos && f.insumos.length > 0));
      } catch (err) {
        console.error('Error cargando fórmulas en FormulaSearchSelect', err);
        if (!mounted) return;
        setFormulas([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <SearchSelect<Formula>
      items={formulas}
      value={value}
      getKey={(f) => f.id}
      getLabel={(f) => `${f.nombre} (${f.porcion || 0}g)`}
      onSelect={(f) => onChange(f)}
      placeholder={loading ? 'Cargando fórmulas...' : 'Buscar o seleccionar fórmula'}
      disabled={loading}
      className={className}
      noResultsText={noResultsText || 'No se encontraron fórmulas'}
      inputAutoFocus={false}
    />
  );
}
