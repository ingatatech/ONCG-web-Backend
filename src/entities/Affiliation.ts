import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("affiliations")
export class Affiliation {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 150 })
  name!: string

  @Column({ type: "varchar", length: 50, nullable: true })
  acronym!: string

  @Column({ type: "text", nullable: true })
  description!: string

  // Used for ordering or display sequence
  @Column({ type: "int", default: 0 })
  sortOrder!: number

  // Control whether it’s visible on the site
  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
