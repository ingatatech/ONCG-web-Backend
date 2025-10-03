import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm"
import { Service } from "./Service"
import { Leaders } from "./Leaders"

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

  @ManyToMany(() => Leaders, { eager: true })
  @JoinTable()
  leaders!: Leaders[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
