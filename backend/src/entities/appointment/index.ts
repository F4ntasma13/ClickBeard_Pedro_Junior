import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "../user";
import { Barber } from "../barber";
import { Specialty } from "../specialty";

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.appointments)
  user!: User;

  @ManyToOne(() => Barber, (barber) => barber.appointments)
  barber!: Barber;

  @ManyToOne(() => Specialty)
  specialty!: Specialty;

  @Column({ name: "appointment_date" })
  date!: Date;

  @Column({ name: "appointment_time" })
  time!: string;

  @Column({ default: "agendado" })
  status!: "scheduled" | "cancelled" | "completed";

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}