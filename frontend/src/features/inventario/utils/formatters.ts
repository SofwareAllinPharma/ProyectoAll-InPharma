export function formatFecha(fecha: string | null | undefined) {
    if (!fecha) return '-';

    // Already formatted dd/mm/yy or dd-mm-yy
        const m = /^([0-3]?\d)[/-]([0-1]?\d)[/-](\d{2})(?:.*)?$/.exec(fecha);
    if (m) {
        const [, dd, mm, yy] = m;
        const d2 = dd.padStart(2, '0');
        const m2 = mm.padStart(2, '0');
        const y2 = yy.padStart(2, '0');
        return `${d2}/${m2}/${y2}`;
    }

    // Try ISO or parseable formats, then format dd/mm/yy
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}
