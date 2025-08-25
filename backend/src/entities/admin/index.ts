import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ name: "phone", nullable: true })
  phone?: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @Column({ name: "is_admin", default: false })
  is_admin!: boolean

  toJSON() {
    const { password, ...adminWithoutPassword } = this;
    return adminWithoutPassword;
  }
}