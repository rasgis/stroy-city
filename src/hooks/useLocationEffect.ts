import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useLocationEffect = (effect: () => void) => {
  const location = useLocation();

  useEffect(() => {
    effect();
  }, [location, effect]);
};
