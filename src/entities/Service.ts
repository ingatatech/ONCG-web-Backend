import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { CaseStudy } from "./CaseStudy"
import { ServiceCategory } from "./ServiceCategory"
import { Expert } from "./Expert"
// import { Leaders } from "./Leaders"

@Entity("services")
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  slug!: string

  @Column()
  name!: string

  @Column("text")
  serviceDescription!: string

  @Column({ default: true })
  isActive!: boolean

  @Column({ default: 0 })
  sortOrder!: number

  @ManyToOne(
    () => ServiceCategory,
    (category) => category.services,
  )
  category!: ServiceCategory

  @OneToMany(
    () => CaseStudy,
    (caseStudy) => caseStudy.service,
    { cascade: true },
  )
  caseStudies!: CaseStudy[]

  @ManyToMany(() => Expert, { eager: true })
  @JoinTable()
  experts!: Expert[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
