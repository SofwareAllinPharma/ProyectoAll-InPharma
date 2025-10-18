export function formatFecha(fecha: string | null | undefined) {
    if (!fecha) return '-';
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-AR');
}
