import { useEffect } from 'react';
import { usePageStore } from '@/store/pageStore';

// @lat: [[frontend#Hooks]]

export const usePageTitle = (title: string, subtitle?: string) => {
  const { setPage, clearPage } = usePageStore();

  useEffect(() => {
    setPage(title, subtitle);
    return () => clearPage();
  }, [title, subtitle]);
};
