import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Устанавливает соединение с MongoDB
 * В случае ошибки процесс завершится с кодом 1
 *
 * @returns {Promise<mongoose.Connection>} Объект соединения с MongoDB
 */
const connectDB = async () => {
  try {
    console.log(
      `[Database] Подключение к MongoDB с URI: ${process.env.MONGO_URI}`
    );

    // Настройки подключения
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // В случае устаревшей версии mongoose раскомментировать:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`[Database] MongoDB подключена: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
