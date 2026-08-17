import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '@/hooks/useLenis';

export function useScrollBehavior() {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    scrollToTop();
  }, [location.pathname]);
}

export default function ScrollToTop() {
  return null;
}