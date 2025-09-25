import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Industry } from "./Industry";

@Entity()
export class Insight {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column("text")
  content!: string;

  @Column()
  image!: string;

  @Column({ type: "int", default: 0 })
  viewCount!: number;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "int", default: 0 })
  displayOrder!: number;
  
  @ManyToOne(
    () => Industry,
    (industry) => industry.insights,
    { onDelete: "CASCADE", nullable: true },
  )
  industry?: Industry;

  @ManyToOne(() => User, (user) => user.insights, { nullable: true })
  author?: User;
}
