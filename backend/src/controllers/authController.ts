import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { Admin, User } from "../entities";
import type { AuthRequest } from "../types";

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const adminRepository = AppDataSource.getRepository(Admin);
    const admin = await adminRepository.findOne({ where: { email, is_admin: true } });

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (admin) {
      const validPassword = await bcrypt.compare(password, admin.password);
      console.log("admin.password: ", admin.password);
      console.log("password: ", password);

      if (!validPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { userId: admin.id, userType: "admin" },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          is_admin: true,
          role: "admin",
        },
      });
    }
    
    if(user) {
      const validPassword = await bcrypt.compare(password, user.password);
      console.log("user.password: ", user.password);
      console.log("password: ", password);

      if (!validPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { userId: user.id, userType: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: true,
          role: "user",
        },
      });
    }

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await userRepository.save(newUser);

    const token = jwt.sign(
      { userId: newUser.id, userType: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.userId;
    const userType = authReq.userType;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "ID de usuário inválido" });
    }

    let user;
    if (userType === "admin") {
      const adminRepository = AppDataSource.getRepository(Admin);
      user = await adminRepository.findOne({ 
        where: { id: userId },
        select: ["id", "name", "email"] 
      });
    } else {
      const userRepository = AppDataSource.getRepository(User);
      user = await userRepository.findOne({ 
        where: { id: userId },
        select: ["id", "name", "email"] 
      });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      user: {
        ...user,
        type: userType,
      },
    });
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};