import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Partners {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;
  
  @Column()
  image!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
