import type { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Barber } from "../entities/barber";
import { Specialty } from "../entities/specialty";
import { Appointment } from "../entities/appointment";
import { In, MoreThan } from "typeorm";

export const getBarbersBySpecialty = async (req: Request, res: Response) => {
  try {
    const { specialtyId } = req.params;

    const barbers = await AppDataSource.getRepository(Barber)
      .createQueryBuilder("barber")
      .innerJoinAndSelect("barber.specialties", "specialty")
      .where("specialty.id = :specialtyId", { specialtyId })
      .orderBy("barber.name", "ASC")
      .getMany();

    res.json({ barbers });
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getAllBarbers = async (req: Request, res: Response) => {
  try {
    const barbers = await AppDataSource.getRepository(Barber).find({
      relations: ["specialties"],
      order: { name: "ASC" },
    });

    res.json({ barbers });
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createBarber = async (req: Request, res: Response) => {
  try {
    const { name, age, hire_date } = req.body;

    const barberRepo = AppDataSource.getRepository(Barber);

    const barber = barberRepo.create({
      name,
      age,
      hireDate: hire_date,
    });

    await barberRepo.save(barber);

    res.status(201).json({ barber });
  } catch (error) {
    console.error("Erro ao criar barbeiro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, age, hire_date } = req.body;

    const barberRepo = AppDataSource.getRepository(Barber);
    const barber = await barberRepo.findOne({
      where: { id: Number(id) },
      relations: ["specialties"],
    });

    if (!barber) {
      return res.status(404).json({ error: "Barbeiro não encontrado" });
    }

    barber.name = name;
    barber.age = age;
    barber.hireDate = hire_date;

    await barberRepo.save(barber);

    res.json({ barber });
  } catch (error) {
    console.error("Erro ao atualizar barbeiro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteBarber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointmentRepo = AppDataSource.getRepository(Appointment);

    const futureAppointments = await appointmentRepo.count({
      where: {
        barber: { id: Number(id) },
        date: MoreThan(new Date()),
        status: "scheduled",
      },
    });

    if (futureAppointments > 0) {
      return res
        .status(400)
        .json({ error: "Não é possível excluir barbeiro com agendamentos futuros" });
    }

    const barberRepo = AppDataSource.getRepository(Barber);
    const barber = await barberRepo.findOneBy({ id: Number(id) });

    if (!barber) {
      return res.status(404).json({ error: "Barbeiro não encontrado" });
    }

    await barberRepo.remove(barber);

    res.json({ message: "Barbeiro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir barbeiro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const associateSpecialties = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("id: ", id);
    const { specialties: specialtyIds } = req.body;
    console.log("specialtyIds: ", specialtyIds);

    if (!id || !specialtyIds || !Array.isArray(specialtyIds) || specialtyIds.length === 0) {
      return res.status(400).json({ error: "ID do barbeiro e especialidades são obrigatórios" });
    }

    const barberId = parseInt(id, 10);
    console.log("barberId: ", barberId);
    if (isNaN(barberId)) return res.status(400).json({ error: "ID do barbeiro inválido" });

    const barberRepo = AppDataSource.getRepository(Barber);
    const specialtyRepo = AppDataSource.getRepository(Specialty);

    const barber = await barberRepo.findOne({ 
      where: { id: barberId },
      relations: ["specialties"],
    });
    if (!barber) return res.status(404).json({ error: "Barbeiro não encontrado" });
    
    const specialtiesToAdd = await specialtyRepo.find({
      where: { id: In(specialtyIds.map(Number)) }
    });
    if (specialtiesToAdd.length === 0) return res.status(404).json({ error: "Especialidades não encontradas" });
    console.log("specialtiesToAdd: ", specialtiesToAdd);

    const newSpecialties = specialtiesToAdd.filter(s => 
      !barber.specialties.some(bs => bs.id === s.id)
    );

    barber.specialties.push(...newSpecialties);
    await barberRepo.save(barber);

    res.json({
      message: "Especialidades associadas com sucesso",
      barber: {
        id: barber.id,
        name: barber.name,
        specialties: barber.specialties.map(s => ({ id: s.id, name: s.name }))
      }
    });
  } catch (error) {
    console.error("Erro ao associar especialidades:", error);
    res.status(500).json({ error: "Erro interno do servidor teste" });
  }
};


export const removeSpecialty = async (req: Request, res: Response) => {
  try {
    const { barberId, specialtyId } = req.params;

    const barberRepo = AppDataSource.getRepository(Barber);

    const barber = await barberRepo.findOne({
      where: { id: Number(barberId) },
      relations: ["specialties"],
    });

    if (!barber) {
      return res.status(404).json({ error: "Barbeiro não encontrado" });
    }

    const updatedSpecialties = barber.specialties.filter(
      (s) => s.id !== Number(specialtyId)
    );

    if (updatedSpecialties.length === barber.specialties.length) {
      return res.status(404).json({ error: "Associação não encontrada" });
    }

    barber.specialties = updatedSpecialties;
    await barberRepo.save(barber);

    res.json({ message: "Especialidade removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover especialidade:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
