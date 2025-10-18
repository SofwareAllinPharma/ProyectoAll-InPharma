export const validateUniqueName = (existingNames: string[] = [], onlyCreate = true) => {
  return (v: string) => {
    if (!onlyCreate) return true;
    if (!v) return true;
    const taken = existingNames.some(n => n.trim().toLowerCase() === v.trim().toLowerCase());
    return taken ? 'Ya existe un deposito con ese nombre' : true;
  };
};

export const minCapacityValidator = (capacidadUsadaActual?: number) => {
  return (value: number) => {
    if (typeof capacidadUsadaActual !== 'number') return true;
    return value >= capacidadUsadaActual ? true : `Debe ser mayor o igual a la capacidad usada actual (${capacidadUsadaActual})`;
  };
};
