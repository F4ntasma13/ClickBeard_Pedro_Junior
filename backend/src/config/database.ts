import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Admin, Appointment, Barber, Specialty, User } from "../entities";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Admin, Appointment, Barber, Specialty],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Conectado ao PostgreSQL local com sucesso!");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
    throw error;
  }
};

