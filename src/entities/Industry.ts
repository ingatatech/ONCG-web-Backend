import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { CaseStudy } from "./CaseStudy"
import { Insight } from "./Insight"
import { Expert } from "./Expert"

@Entity("industries")
export class Industry {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  slug!: string

  @Column()
  name!: string

  @Column("text")
  industryDescription!: string

  @Column({ default: true })
  isActive!: boolean

  @OneToMany(
    () => CaseStudy,
    (caseStudy: CaseStudy) => caseStudy.industry,
    { cascade: true },
  )
  caseStudies!: CaseStudy[]

  @OneToMany(
    () => Insight,
    (insight: Insight) => insight.industry,
    { cascade: true },
  )
  insights!: Insight[]

  @ManyToMany(() => Expert)
  @JoinTable()
  experts!: Expert[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
