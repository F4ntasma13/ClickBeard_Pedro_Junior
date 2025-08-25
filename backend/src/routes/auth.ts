import { Router } from "express"
import { loginAdmin, registerUser, verifyToken } from "../controllers/authController"

import { validateLogin, validateRegister } from "../middleware/validation"

const router = Router()

router.post("/login", validateLogin)
router.post("/admin/login", validateLogin, loginAdmin)
router.post("/register", validateRegister, registerUser)

import { authenticateToken } from "../middleware/auth"
router.get("/me", authenticateToken, verifyToken)

export default router
