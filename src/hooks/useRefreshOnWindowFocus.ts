import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRefreshOnWindowFocus = (queryKeys: string[]) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, [queryClient, queryKeys]);
};
