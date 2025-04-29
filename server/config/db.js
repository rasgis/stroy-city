import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log(
      `[Database] Подключение к MongoDB с URI: ${process.env.MONGO_URI}`
    );

    const conn = await mongoose.connect(process.env.MONGO_URI, {});

    console.log(`[Database] MongoDB подключена: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
