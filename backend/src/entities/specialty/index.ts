import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Appointment } from "../appointment";

@Entity("specialties")
export class Specialty {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "decimal" })
  price!: number;

  @Column()
  duration!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.specialty)
  appointments!: Appointment[];
}