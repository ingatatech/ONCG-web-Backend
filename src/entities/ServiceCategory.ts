import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Service } from "./Service"

@Entity("service_categories")
export class ServiceCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  slug!: string

  @Column()
  name!: string

  @Column("text")
  description!: string

  @Column({ default: true })
  isActive!: boolean

  @Column({ default: 0 })
  sortOrder!: number

  @OneToMany(
    () => Service,
    (service) => service.category,
  )
  services!: Service[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
