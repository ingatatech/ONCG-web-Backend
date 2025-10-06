import type { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Leaders } from "../entities/Leaders";
import { validationResult } from "express-validator";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";
import { uploadImage } from "../utils/uploadImage";

const leaderRepository = AppDataSource.getRepository(Leaders);

export const createLeader = authAsyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
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
    } = req.body;
function safeParseArray(field: any): string[] {
  if (!field) return []

  // If already an array (like coming from Postman JSON body)
  if (Array.isArray(field)) return field

  // If it's a string, try to parse
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      // fallback: return as single-element array
      return [field]
    }
  }

  // fallback if unexpected type
  return []
}


const parsedEducation = safeParseArray(education)
const parsedprofessionalMembership = safeParseArray(professionalMembership)
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }
    // Check for duplicate leader by name and title
    const existingLeader = await leaderRepository.findOne({
      where: { name, title },
    });

    if (existingLeader) {
      return res.status(409).json({
        success: false,
        message: "A leader with this name and title already exists",
      });
    }

    // Get the next order value
    const maxOrder = (await leaderRepository.maximum("sortOrder")) || 0;

    const leader = leaderRepository.create({
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
    });

    const savedLeader = await leaderRepository.save(leader);
    // console.log(savedLeader);
    res.status(201).json({
      success: true,
      message: "Leader created successfully",
      data: savedLeader,
    });
  }
);

export const getLeaders = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const {
    department,
    isActive,
    page = 1,
    limit = 20,
    sortBy = "sortOrder",
    sortOrder = "asc",
  } = req.query;

  const queryBuilder = leaderRepository.createQueryBuilder("leader");

  // Apply filters
  if (department) {
    queryBuilder.andWhere("leader.department = :department", { department });
  }

  if (isActive !== undefined) {
    queryBuilder.andWhere("leader.isActive = :isActive", {
      isActive: isActive === "true",
    });
  }

  // Apply sorting
  queryBuilder.orderBy(
    `leader.${sortBy}`,
    sortOrder === "desc" ? "DESC" : "ASC"
  );

  // Apply pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  const [leaders, total] = await queryBuilder.getManyAndCount();
  res.json({
    success: true,
    data: leaders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getLeaderById = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const leader = await leaderRepository.findOne({ where: { id } });

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }


    res.json({
      success: true,
      data: leader,
    });
  }
);

export const updateLeader = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const leader = await leaderRepository.findOne({ where: { id } });

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    // Check for duplicate if name or title is being updated
    if (req.body?.name || req.body?.title) {
      const name = req.body.name || leader.name;
      const title = req.body.title || leader.title;

      const existingLeader = await leaderRepository.findOne({
        where: { name, title },
      });

      if (existingLeader && existingLeader.id !== id) {
        return res.status(409).json({
          success: false,
          message: "A leader with this name and title already exists",
        });
      }
    }
    if (req.file) {
      leader.image = await uploadImage(req.file.path);
    }

    // Parse JSON strings for arrays before assigning
   const updateData = { ...req.body }
  if (updateData.education) {
    updateData.education = JSON.parse(updateData.education)
  }

 if (updateData.professionalMembership) {
    updateData.professionalMembership = JSON.parse(updateData.professionalMembership)
  }
    Object.assign(leader, updateData);
    const updatedLeader = await leaderRepository.save(leader);

    res.json({
      success: true,
      message: "Leader updated successfully",
      data: updatedLeader,
    });
  }
);

export const deleteLeader = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
  const result = await leaderRepository.delete(id);

    if (result.affected === 0) {
    return res.status(404).json({
      success: false,
      message: "Leader not found",
    });
  }

    res.json({
      success: true,
      message: "Leader deleted successfully",
    });
  }
);

export const getDepartments = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const departments = await leaderRepository
        .createQueryBuilder("leader")
        .select("DISTINCT leader.department", "department")
        .where("leader.department IS NOT NULL")
        .andWhere("leader.department != ''")
        .orderBy("leader.department", "ASC")
        .getRawMany();

      const departmentList = departments.map((dept) => dept.department);

      res.json({
        success: true,
        data: departmentList,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch departments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export const reorderLeaders = async (req: Request, res: Response) => {
  try {
    const { leaderIds } = req.body;
    if (!Array.isArray(leaderIds) || leaderIds.length === 0) {
      return res.status(400).json({ message: "Member IDs array is required" });
    }
    // Update each member's order based on their title in the array
    const updatePromises = leaderIds.map((leaderId: string, index: number) => {
      return leaderRepository.update(
        { id: leaderId },
        { sortOrder: index + 1 }
      );
    });
    await Promise.all(updatePromises);
    res.json({ message: "Leaders reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error reordering Leaders", error: err });
  }
};
