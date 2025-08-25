import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, JoinTable, ManyToMany } from "typeorm";
import { Appointment } from "../appointment";
import { Specialty } from "../specialty";

@Entity("barbers")
export class Barber {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  age!: number;

  @Column({ name: "hire_date" })
  hireDate: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToMany(() => Specialty)
    @JoinTable()
    specialties: Specialty[];


  @OneToMany(() => Appointment, (appointment) => appointment.barber)
  appointments!: Appointment[];
}