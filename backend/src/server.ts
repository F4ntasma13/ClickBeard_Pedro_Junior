import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { initializeDatabase } from "./config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas tentativas, tente novamente em 15 minutos",
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("Banco de dados conectado");

    const authRoutes = await import("./routes/auth"); 
    const publicRoutes = await import("./routes/public");
    const appointmentRoutes = await import("./routes/appointments");
    const adminRoutes = await import("./routes/admin");

    app.use("/api/auth", authRoutes.default);
    app.use("/api", publicRoutes.default);
    app.use("/api/appointments", appointmentRoutes.default);
    app.use("/api/admin", adminRoutes.default);

    app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("Erro não tratado:", err);
      res.status(500).json({ error: "Erro interno do servidor" });
    });

    app.use("*", (req, res) => {
      res.status(404).json({ error: "Rota não encontrada" });
    });

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error("Falha ao inicializar o servidor:", error);
    process.exit(1);
  }
};

startServer();

export default app;