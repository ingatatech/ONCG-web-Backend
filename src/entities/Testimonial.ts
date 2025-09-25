// src/entities/Testimonial.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Testimonial {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  leaderName!: string;

  @Column()
  companyName!: string;

  @Column()
  role!: string;

  @Column("text")
  quote!: string;

  @Column()
  leaderImage!: string; // store Cloudinary URL

  @Column({ default: false })
  approved!: boolean;
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
