import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSmartRedirect = (delay = 5000, targetPath = '/dashboard') => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(targetPath);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, targetPath, navigate]);
};
