import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Specialty } from "../entities/specialty";
import { Appointment } from "../entities/appointment";

const specialtyRepository = AppDataSource.getRepository(Specialty);
const appointmentRepository = AppDataSource.getRepository(Appointment);

export const getAllSpecialties = async (req: Request, res: Response) => {
  try {
    const specialties = await specialtyRepository.find({
      order: { name: "ASC" },
    });

    res.json({ specialties });
  } catch (error) {
    console.error("Erro ao buscar especialidades:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createSpecialty = async (req: Request, res: Response) => {
  try {
    const { name, price, duration } = req.body;

    const specialty = specialtyRepository.create({
      name,
      price,
      duration,
    });

    await specialtyRepository.save(specialty);

    res.status(201).json({ specialty });
  } catch (error) {
    console.error("Erro ao criar especialidade:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;

    const specialty = await specialtyRepository.findOne({ where: { id: Number(id) } });

    if (!specialty) {
      return res.status(404).json({ error: "Especialidade não encontrada" });
    }

    specialty.name = name;
    specialty.price = price;
    specialty.duration = duration;

    await specialtyRepository.save(specialty);

    res.json({ specialty });
  } catch (error) {
    console.error("Erro ao atualizar especialidade:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const futureAppointments = await appointmentRepository.count({
      where: {
        specialty: { id: Number(id) },
        date: new Date(),
        status: "scheduled",
      },
    });

    if (futureAppointments > 0) {
      return res
        .status(400)
        .json({ error: "Não é possível excluir especialidade com agendamentos futuros" });
    }

    const specialty = await specialtyRepository.findOne({ where: { id: Number(id) } });

    if (!specialty) {
      return res.status(404).json({ error: "Especialidade não encontrada" });
    }

    await specialtyRepository.remove(specialty);

    res.json({ message: "Especialidade excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir especialidade:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

