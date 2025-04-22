import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { hideNotification } from "../../reducers/notificationsSlice";
import { Notification } from "../Notification/Notification";

export const GlobalNotification: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, message } = useSelector(
    (state: RootState) => state.notifications
  );

  const handleClose = useCallback(() => {
    dispatch(hideNotification());
  }, [dispatch]);

  return (
    <Notification
      message={message}
      isOpen={isOpen}
      onClose={handleClose}
      autoHideDuration={3000}
    />
  );
};

export default GlobalNotification;
