import type { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Appointment, User, Barber, Specialty } from "../entities";
import { Between } from "typeorm"; 
import { startOfDay, endOfDay } from "date-fns";


export const getStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [appointmentsToday, totalBarbers, totalSpecialties, totalUsers] = await Promise.all([
      AppDataSource.getRepository(Appointment).count({ 
        where: { 
          date: Between(startOfDay, endOfDay), 
          status: "scheduled"
        } 
      }),
      AppDataSource.getRepository(Barber).count(),
      AppDataSource.getRepository(Specialty).count(),
      AppDataSource.getRepository(User).count(),
    ]);

    res.json({
      appointmentsToday,
      totalBarbers,
      totalSpecialties,
      totalUsers,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const TIME_ZONE_OFFSET = -3 * 60 * 60 * 1000;

export const getTodayAppointments = async (req: Request, res: Response) => {
  try {

    const now = new Date();
    const start = startOfDay(now);
    const end = endOfDay(now);

    const startUtc = new Date(start.getTime() - TIME_ZONE_OFFSET);
    const endUtc = new Date(end.getTime() - TIME_ZONE_OFFSET);

    console.log("Consultando agendamentos de hoje:", {
      start: start.toISOString(),
      end: end.toISOString(),
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
    });

    const appointment = await AppDataSource.getRepository(Appointment)
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.user", "user")
      .leftJoinAndSelect("appointment.barber", "barber")
      .leftJoinAndSelect("appointment.specialty", "specialty")
      .where("appointment.date BETWEEN :start AND :end", { start: startUtc, end: endUtc })
      .orderBy("appointment.date", "ASC")
      .getMany();

    console.log(`Agendamentos encontrados: ${appointment.length}`);

    res.json({
      success: true,
      data: {
        date: now.toISOString().split("T")[0],
        timeZone: "America/Sao_Paulo",
        count: appointment.length,
        appointment,
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar agendamentos de hoje:", {
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "QueryFailedError") {
      return res.status(500).json({
        success: false,
        error: "Erro na consulta ao banco de dados",
        details: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

export const getFutureAppointments = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfTomorrow = new Date(today);
    startOfTomorrow.setDate(today.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const appointments = await AppDataSource.getRepository(Appointment)
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.user", "user")
      .leftJoinAndSelect("appointment.barber", "barber")
      .leftJoinAndSelect("appointment.specialty", "specialty")
      .where("appointment.date >= :startOfTomorrow", { startOfTomorrow })
      .orderBy("appointment.date", "ASC")
      .getMany();

    res.json({ appointments });
  } catch (error: any) {
    console.error("Erro ao buscar agendamentos futuros:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: error.message });
  }
};