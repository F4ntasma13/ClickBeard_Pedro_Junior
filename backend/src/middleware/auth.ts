import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../types";

export const authenticateToken = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const authRequest = req as unknown as AuthRequest;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token de acesso requerido" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Token inválido" });
      return;
    }

    authRequest.userId = decoded.userId;
    authRequest.userType = decoded.userType || decoded.role || decoded.type;
    next();
  });
};

export const requireAdmin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const authRequest = req as unknown as AuthRequest;
  
  if (!authRequest.userType) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  if (authRequest.userType !== "admin") {
    res.status(403).json({ error: "Acesso negado. Privilégios de administrador requeridos." });
    return;
  }
  
  next();
};