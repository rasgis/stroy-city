import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../hooks";
import { authService } from "../services/authService";
import { updateUserData } from "../reducers/authSlice";
import { validateAndSyncUserData } from "../utils/securityUtils";

const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const [isSecurityChecked, setIsSecurityChecked] = useState(false);

  useEffect(() => { 
    const checkSecurity = async () => {
      try {
        if (!authService.isTokenValid()) {
          authService.clearAuthData();
          dispatch(updateUserData(null));
          setIsSecurityChecked(true);
          return;
        }

        const { valid, user } = validateAndSyncUserData();
        
        if (!valid) {
          authService.clearAuthData();
          dispatch(updateUserData(null));
        } else if (user) {
          dispatch(updateUserData(user));
        }

        setIsSecurityChecked(true);
      } catch (error) {
        console.error("Ошибка при проверке безопасности:", error);
        authService.clearAuthData();
        dispatch(updateUserData(null));
        setIsSecurityChecked(true);
      }
    };

    checkSecurity();
  }, [dispatch]);

  if (!isSecurityChecked) {
    return null;
  };
  return <>{children}</>;
};

export default SecurityProvider;
