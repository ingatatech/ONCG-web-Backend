import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"

@Entity("leaders")
export class Leaders {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column()
  title!: string

  @Column()
  department!: string

  @Column({ type: "text" })
  bio!: string

  @Column()
  image!: string;

  @Column()
  location!: string

  @Column({ type: "int", default: 0 })
  experience!: number

  @Column({ type: "int", default: 0 })
  projectsLed!: number

  @Column({ type: "varchar", length: 255, nullable: true })
  linkedinUrl!: string

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string

  @Column("text", { array: true })
  credentials!: string[]
  
  @Column("text", { array: true,nullable: true })
  specialties!: string[]

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @Column({ type: "int", default: 0 })
  displayOrder!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
