import { Router } from "express"
import { getAllSpecialties } from "../controllers/specialtyController"
import { getAllBarbers, getBarbersBySpecialty } from "../controllers/barberController"

const router = Router()

router.get("/specialties", getAllSpecialties)
router.get("/barbers", getAllBarbers)
router.get("/barbers/specialty/:specialtyId", getBarbersBySpecialty)

export default router
