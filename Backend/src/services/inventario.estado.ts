// helper de estado
export type EstadoStock = 'critico' | 'bajo' | 'normal' | 'default';

export function calcularEstado(cantidad: number, umbralMin: number | null | undefined): EstadoStock {
  if (umbralMin == null) return 'default';
  if (cantidad < umbralMin) return 'critico';
  if (cantidad <= umbralMin + 5) return 'bajo';
  return 'normal';
}
