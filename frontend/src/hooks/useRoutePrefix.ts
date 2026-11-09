import { useLocation } from 'react-router-dom';

export const useRoutePrefix = () => {
  const location = useLocation();
  
  if (location.pathname.startsWith('/tecnico')) {
    return '/tecnico';
  }

  if (location.pathname.startsWith('/adminfab')) {
    return '/adminfab';
  }
  
  if (location.pathname.startsWith('/puntoventa')) return '/puntoventa';
  return '/adminsis';
};
