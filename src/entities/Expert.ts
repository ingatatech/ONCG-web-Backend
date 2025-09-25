import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToMany, 
  CreateDateColumn, 
  UpdateDateColumn 
} from "typeorm"
import { Service } from "./Service"

export enum RoleType {
  EXPERT = "expert",
  LEADER = "leader",
}

@Entity()
export class Expert {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  name!: string

  @Column()
  title!: string

  @Column({ type: "text" })
  bio!: string

  @Column()
  image!: string

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

  @Column({ type: "varchar", length: 255, nullable: true })
  phone!: string

  @Column("text", { array: true })
  education!: string[]
  
  @Column("text", { array: true, nullable: true })
  specialties!: string[]

  @Column("text", { array: true, nullable: true })
  professionalMembership!: string[]

  @Column({ default: 0 })
  sortOrder!: number

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @Column({
    type: "enum",
    enum: RoleType,
    default: RoleType.EXPERT,
  })
  role!: RoleType

  @ManyToMany(() => Service, (service) => service.experts)
  services!: Service[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
