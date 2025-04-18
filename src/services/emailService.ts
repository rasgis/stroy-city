import axios from "axios";
import { API_CONFIG } from "../config/api";

interface EmailData {
  name: string;
  email: string;
  message: string;
}

export const emailService = {
  async sendEmail(data: EmailData): Promise<void> {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/email/send`,
        data
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Ошибка при отправке сообщения"
        );
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Ошибка при отправке сообщения"
        );
      }
      throw error;
    }
  },
};
