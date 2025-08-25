import type { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import type { AuthRequest } from "../types";
import { Appointment } from "../entities";

interface CreateAppointmentRequest {
  barberId: number;
  specialtyId: number;
  date: string;
  time: string;
}

const validateAppointmentRequest = (body: any): body is CreateAppointmentRequest => {
  return (
    body &&
    typeof body.barberId === 'number' &&
    typeof body.specialtyId === 'number' &&
    typeof body.date === 'string' &&
    typeof body.time === 'string'
  );
};

export const getAvailableTimes = async (req: Request, res: Response) => {
  try {
    const { barberId, date } = req.query;

    if (!barberId || !date) {
      return res.status(400).json({ error: "Id do Barbeiro e data são obrigatórios" });
    }

    const existingAppointments = await AppDataSource.getRepository(Appointment).find({
      where: {
        barber: { id: Number(barberId) },
        date: new Date(date as string),
        status: "scheduled"
      }
    });

    const bookedTimes = existingAppointments.map(appointment => {
      return appointment.date.toTimeString().slice(0, 5);
    });

    const allTimes = [];
    for (let hour = 8; hour < 18; hour++) {
      allTimes.push(`${hour.toString().padStart(2, "0")}:00`);
      allTimes.push(`${hour.toString().padStart(2, "0")}:30`);
    }

    const availableTimes = allTimes.filter((time) => !bookedTimes.includes(time));

    res.json({ availableTimes });
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    
    if (!validateAppointmentRequest(req.body)) {
      return res.status(400).json({ 
        error: "Dados inválidos para agendamento",
        details: "ID do Barbeiro e ID da especialidade devem ser números, date e time devem ser strings"
      });
    }

    const { barberId, specialtyId, date, time } = req.body;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const appointmentDateTime = new Date(`${date}T${time}`);
    
    const existingAppointment = await AppDataSource.getRepository(Appointment).findOne({
      where: {
        barber: { id: barberId },
        date: appointmentDateTime,
        time,
        status: "scheduled"
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "Horário não disponível" });
    }

    const appointmentRepository = AppDataSource.getRepository(Appointment);
    const newAppointment = appointmentRepository.create({
      date: appointmentDateTime,
      time,
      status: "scheduled",
      user: { id: userId },
      barber: { id: barberId },
      specialty: { id: specialtyId }
    });

    await appointmentRepository.save(newAppointment);

    res.status(201).json({ 
      message: "Agendamento criado com sucesso",
      appointment: newAppointment 
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getUserAppointments = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const appointments = await AppDataSource.getRepository(Appointment)
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.barber", "barber")
      .leftJoinAndSelect("appointment.specialty", "specialty")
      .leftJoinAndSelect("appointment.user", "user")
      .where("appointment.user.id = :userId", { userId })
      .orderBy("appointment.date", "DESC")
      .getMany();

    res.json({ appointments });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const { id } = req.params;
    const userId = authReq.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const appointmentRepository = AppDataSource.getRepository(Appointment);
    
    const appointment = await appointmentRepository.findOne({
      where: {
        id: Number(id),
        user: { id: userId }
      },
      relations: ["user"]
    });

    if (!appointment) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    const now = new Date();
    const timeDiff = appointment.date.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 2) {
      return res
        .status(400)
        .json({ error: "Não é possível cancelar agendamentos com menos de 2 horas de antecedência" });
    }

    appointment.status = "cancelled";
    await appointmentRepository.save(appointment);

    res.json({ message: "Agendamento cancelado com sucesso" });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
