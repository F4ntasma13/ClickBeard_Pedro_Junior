import { Router } from "express"
import {
  getAvailableTimes,
  createAppointment,
  getUserAppointments,
  cancelAppointment,
} from "../controllers/appointmentController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.get("/available-times", getAvailableTimes)
router.post("/", authenticateToken, createAppointment)
router.get("/my", authenticateToken, getUserAppointments)
router.get("/my-appointments", authenticateToken, getUserAppointments)
router.patch("/:id/cancel", authenticateToken, cancelAppointment)

export default router
