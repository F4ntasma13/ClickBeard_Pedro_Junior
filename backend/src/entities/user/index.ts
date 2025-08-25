import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Appointment } from "../appointment";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ name: "phone", nullable: true })
  phone?: string;

  @Column({ name: "is_admin", default: false })
  is_admin!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments!: Appointment[];
}