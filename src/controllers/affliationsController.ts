import { Request, Response } from "express"
import { validationResult } from "express-validator"
import { AppDataSource } from "../data-source"
import { Affiliation } from "../entities/Affiliation"
import { authAsyncHandler } from "../utils/asyncHandler"

const affiliationRepo = AppDataSource.getRepository(Affiliation)

/**
 * Create a new affiliation
 */
export const createAffiliation = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }

  const { name, acronym, description, sortOrder = 0, isActive = true } = req.body

  // Check if an affiliation with same name or acronym exists
  const existing = await affiliationRepo.findOne({ where: [{ name }, { acronym }] })
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Affiliation with this name or acronym already exists",
    })
  }

  const affiliation = affiliationRepo.create({
    name,
    acronym,
    description,
    sortOrder,
    isActive,
  })

  const savedAffiliation = await affiliationRepo.save(affiliation)

  res.status(201).json({
    success: true,
    message: "Affiliation created successfully",
    data: savedAffiliation,
  })
})

/**
 * Get all affiliations
 */
export const getAllAffiliations = authAsyncHandler(async (_req: Request, res: Response) => {
  const affiliations = await affiliationRepo.find({
    where: { isActive: true },
    order: { sortOrder: "ASC" },
  })

  res.status(200).json({
    success: true,
    count: affiliations.length,
    data: affiliations,
  })
})

/**
 * Get a single affiliation by ID
 */
export const getAffiliationById = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const affiliation = await affiliationRepo.findOne({ where: { id } })

  if (!affiliation) {
    return res.status(404).json({
      success: false,
      message: "Affiliation not found",
    })
  }

  res.status(200).json({
    success: true,
    data: affiliation,
  })
})

/**
 * Update affiliation
 */
export const updateAffiliation = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const affiliation = await affiliationRepo.findOne({ where: { id } })

  if (!affiliation) {
    return res.status(404).json({
      success: false,
      message: "Affiliation not found",
    })
  }

  const updates = req.body
  Object.assign(affiliation, updates)

  const updatedAffiliation = await affiliationRepo.save(affiliation)

  res.status(200).json({
    success: true,
    message: "Affiliation updated successfully",
    data: updatedAffiliation,
  })
})

/**
 * Delete affiliation
 */
export const deleteAffiliation = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const affiliation = await affiliationRepo.findOne({ where: { id } })

  if (!affiliation) {
    return res.status(404).json({
      success: false,
      message: "Affiliation not found",
    })
  }

  await affiliationRepo.remove(affiliation)

  res.status(200).json({
    success: true,
    message: "Affiliation deleted successfully",
  })
})
