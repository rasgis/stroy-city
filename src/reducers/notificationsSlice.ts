import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationState {
  isOpen: boolean;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

const initialState: NotificationState = {
  isOpen: false,
  message: "",
  type: "success",
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<Omit<NotificationState, "isOpen">>
    ) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.type = action.payload.type || "success";
    },
    hideNotification: (state) => {
      state.isOpen = false;
    },
  },
});

export const { showNotification, hideNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
