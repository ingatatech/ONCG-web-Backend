import type { Request, Response } from "express"
import { AppDataSource } from "../data-source"
import { Expert } from "../entities/Expert"
import { validationResult } from "express-validator"
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler"
import { uploadImage } from "../utils/uploadImage"

const expertRepository = AppDataSource.getRepository(Expert)

export const createExpert = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }

  const {
    name,
    title,
    bio,
    email,
    linkedinUrl,
    phone,
    location,
    experience,
    projectsLed,
    education,
    realisedProjects,
    professionalMembership
  } = req.body

  // Parse JSON strings for arrays
  const parsedEducation = education ? JSON.parse(education) : []
  const parsedprofessionalMembership = professionalMembership ? JSON.parse(professionalMembership) : []

  let imageUrl = ""
  if (req.file) {
    imageUrl = await uploadImage(req.file.path)
  }

  // Check for duplicate expert by name and title
  const existingExpert = await expertRepository.findOne({
    where: { name, title },
  })

  if (existingExpert) {
    return res.status(409).json({
      success: false,
      message: "An expert with this name and title already exists",
    })
  }

  // Get the next sort order value
  const maxOrder = (await expertRepository.maximum("sortOrder")) || 0

  const expert = expertRepository.create({
    name,
    title,
    bio,
    email,
    linkedinUrl,
    phone,
    location,
    experience: Number(experience) || 0,
    projectsLed: Number(projectsLed) || 0,
    education: parsedEducation,
    professionalMembership: parsedprofessionalMembership,
    realisedProjects: realisedProjects,
    image: imageUrl,
    sortOrder: maxOrder + 1,
  })

  const savedExpert = await expertRepository.save(expert)

  res.status(201).json({
    success: true,
    message: "Expert created successfully",
    data: savedExpert,
  })
})

export const getExperts = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }

  const { 
    page = 1, 
    limit = 50, 
    sortBy = "sortOrder", 
    sortOrder = "asc",
    search 
  } = req.query

  const queryBuilder = expertRepository.createQueryBuilder("expert")

  if (search) {
    queryBuilder.andWhere(
      "(expert.name ILIKE :search OR expert.title ILIKE :search OR expert.bio ILIKE :search)",
      { search: `%${search}%` }
    )
  }

  // Apply sorting
  const validSortFields = ["name", "title", "sortOrder", "createdAt",]
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : "sortOrder"
  const order = sortOrder === "desc" ? "DESC" : "ASC"
  queryBuilder.orderBy(`expert.${sortField}`, order)

  // Apply pagination
  const skip = (Number(page) - 1) * Number(limit)
  queryBuilder.skip(skip).take(Number(limit))

  const [experts, total] = await queryBuilder.getManyAndCount()

  res.json({
    success: true,
    data: experts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  })
})

export const updateExpert = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }

  const { id } = req.params
  const expert = await expertRepository.findOne({ where: { id } })

  if (!expert) {
    return res.status(404).json({
      success: false,
      message: "Expert not found",
    })
  }

  // Check for duplicate if name or title is being updated
  if (req.body?.name || req.body?.title) {
    const name = req.body.name || expert.name
    const title = req.body.title || expert.title

    const existingExpert = await expertRepository.findOne({
      where: { name, title },
    })

    if (existingExpert && existingExpert.id !== id) {
      return res.status(409).json({
        success: false,
        message: "An expert with this name and title already exists",
      })
    }
  }

  // Handle image upload if provided
  if (req.file) {
    expert.image = await uploadImage(req.file.path)
  }

  // Parse JSON strings for arrays before assigning
  const updateData = { ...req.body }
  if (updateData.education) {
    updateData.education = JSON.parse(updateData.education)
  }
 if (updateData.professionalMembership) {
    updateData.professionalMembership = JSON.parse(updateData.professionalMembership)
  }


  Object.assign(expert, updateData)
  const updatedExpert = await expertRepository.save(expert)

  res.json({
    success: true,
    message: "Expert updated successfully",
    data: updatedExpert,
  })
})

// ✅ Get one expert by ID
export const getExpertById = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }

  const { id } = req.params
  const expert = await expertRepository.findOne({ where: { id } })

  if (!expert) {
    return res.status(404).json({
      success: false,
      message: "Expert not found",
    })
  }

  res.json({
    success: true,
    data: expert,
  })
})

export const deleteExpert = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const result = await expertRepository.delete(id);

  if (result.affected === 0) {
    return res.status(404).json({
      success: false,
      message: "Expert not found",
    });
  }

  res.json({
    success: true,
    message: "Expert deleted successfully",
  });
});




export const reorderExperts = asyncHandler(async (req: Request, res: Response) => { const { expertIds } = req.body 
if (!Array.isArray(expertIds) || expertIds.length === 0) {
   return res.status(400).json({ success: false, message: "Expert IDs array is required", }) } 
   try { 
  // Update each expert's sort order based on their position in the array 
  const updatePromises = expertIds.map((expertId: string, index: number) => { return expertRepository.update({ id: expertId }, { sortOrder: index + 1 }) }) 
  await Promise.all(updatePromises) 
  res.json({ success: true, message: "Experts reordered successfully", }) 
} catch (error) { res.status(500).json({ success: false, message: "Error reordering experts", error: error instanceof Error ? error.message : "Unknown error", }) } })