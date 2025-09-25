import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Industry } from "./Industry"
import { Service } from "./Service"

export enum CaseStudyImpact {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  TRANSFORMATIONAL = "Transformational",
}

@Entity("industry_case_studies")
export class CaseStudy {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  title!: string

  @Column("text")
  description!: string

  @Column("text")
  impact!: string

  @Column({ default: 0 })
  displayOrder!: number

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @ManyToOne(
    () => Industry,
    (industry) => industry.caseStudies,
    { onDelete: "CASCADE", nullable: true },
  )
  industry?: Industry

  @ManyToOne(
    () => Service,
    (service) => service.caseStudies,
    { onDelete: "CASCADE", nullable: true },
  )
  service?: Service

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
