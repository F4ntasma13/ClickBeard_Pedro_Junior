import { Router } from "express"
import { getStats, getTodayAppointments, getFutureAppointments } from "../controllers/adminController"
import {
  getAllBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  associateSpecialties ,
  removeSpecialty,
} from "../controllers/barberController"
import {
  getAllSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "../controllers/specialtyController"
import { authenticateToken, requireAdmin } from "../middleware/auth"
import { validateBarber, validateSpecialty } from "../middleware/validation"

const router = Router()

router.use(authenticateToken, requireAdmin)

router.get("/stats", getStats)

router.get("/appointments/today", getTodayAppointments)
router.get("/appointments/future", getFutureAppointments)

router.get("/barbers", getAllBarbers)
router.post("/barbers", validateBarber, createBarber)
router.put("/barbers/:id", validateBarber, updateBarber)
router.delete("/barbers/:id", deleteBarber)
router.post("/barbers/:id/specialties", associateSpecialties )
router.delete("/barbers/:barberId/specialties/:specialtyId", removeSpecialty)

router.get("/specialties", getAllSpecialties)
router.post("/specialties", validateSpecialty, createSpecialty)
router.put("/specialties/:id", validateSpecialty, updateSpecialty)
router.delete("/specialties/:id", deleteSpecialty)

export default router
