export const formatUserName = (email?: string | null): string => {
  if (!email) return '-';
  
  const special: Record<string, string> = {
    'tecnico@aip.com': 'Técnico',
    'adminfab@aip.com': 'Admin Fábrica',
    'adminsis@aip.com': 'Admin Sistema',
  };
  
  if (special[email]) return special[email];
  
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
};

export const formatCantidad = (pedido: {
  cantAProducir_paquetes?: number | null;
  cantAProducir_porciones?: number | null;
  cantAProducir_gramos?: number | null;
}): string => {
  const paquetes = Number(pedido.cantAProducir_paquetes) || 0;
  const porciones = Number(pedido.cantAProducir_porciones) || 0;
  const gramos = Number(pedido.cantAProducir_gramos) || 0;
  
  if (paquetes >= 1) return `${Math.round(paquetes)} pqt`;
  if (porciones >= 1) return `${Math.round(porciones)} porciones`;
  return `${Math.round(gramos)} g`;
};
