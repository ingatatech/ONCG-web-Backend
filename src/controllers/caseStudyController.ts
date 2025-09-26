import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CaseStudy, CaseStudyImpact } from "../entities/CaseStudy";
import { Industry } from "../entities/Industry";
import { Service } from "../entities/Service";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";

const caseStudyRepo = AppDataSource.getRepository(CaseStudy);
const industryRepo = AppDataSource.getRepository(Industry);
const serviceRepo = AppDataSource.getRepository(Service);

interface MulterRequest extends Request {
  file?: any;
}

// Get all case studies with optional filtering and pagination
export const getCaseStudies = asyncHandler(async (req: Request, res: Response) => {
  const {
    industryId,
    serviceId,
    impact,
    isActive,
    page = 1,
    limit = 50,
    sortBy = "displayOrder",
    sortOrder = "asc",
    search,
  } = req.query;

  const queryBuilder = caseStudyRepo
    .createQueryBuilder("caseStudy")
    .leftJoinAndSelect("caseStudy.industry", "industry")
    .leftJoinAndSelect("caseStudy.service", "service");

  // Apply filters
  if (industryId) {
    queryBuilder.andWhere("caseStudy.industryId = :industryId", { industryId });
  }

  if (serviceId) {
    queryBuilder.andWhere("caseStudy.serviceId = :serviceId", { serviceId });
  }

  if (impact) {
    queryBuilder.andWhere("caseStudy.impact = :impact", { impact });
  }

  if (isActive !== undefined) {
    queryBuilder.andWhere("caseStudy.isActive = :isActive", { isActive: isActive === "true" });
  }

  if (search) {
    queryBuilder.andWhere(
      "(caseStudy.title ILIKE :search OR caseStudy.description ILIKE :search OR caseStudy.impact ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Apply sorting
  const validSortFields = ["title", "displayOrder", "impact", "createdAt"];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : "displayOrder";
  const order = sortOrder === "desc" ? "DESC" : "ASC";
  queryBuilder.orderBy(`caseStudy.${sortField}`, order);

  // Apply pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  const [caseStudies, total] = await queryBuilder.getManyAndCount();

  res.json({
    caseStudies,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// Get a single case study by ID
export const getCaseStudy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const caseStudy = await caseStudyRepo.findOne({
    where: { id },
    relations: ["industry", "service"],
  });

  if (!caseStudy) {
    return res.status(404).json({ message: "Case study not found" });
  }

  res.json(caseStudy);
});

// Create a new case study
export const createCaseStudy = authAsyncHandler(async (req: MulterRequest, res: Response) => {
  const {
    title,
    description,
    impact,
    industryId,
    serviceId,
    isActive = true,
  } = req.body;

  // Validate that either industryId or serviceId is provided
  if (!industryId && !serviceId) {
    return res.status(400).json({ 
      message: "Either industryId or serviceId must be provided" 
    });
  }

  const maxOrder = (await caseStudyRepo.maximum("displayOrder")) || 0;

  const caseStudy = caseStudyRepo.create({
    title,
    description,
    impact,
    displayOrder:maxOrder+1,
    isActive,
  });

  // Set industry or service based on provided IDs
  if (industryId) {
    const industry = await industryRepo.findOne({ where: { id: industryId } });
    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }
    caseStudy.industry = industry;
  }

  if (serviceId) {
    const service = await serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    caseStudy.service = service;
  }

  const savedCaseStudy = await caseStudyRepo.save(caseStudy);

  // Fetch the complete case study with relations
  const completeCaseStudy = await caseStudyRepo.findOne({
    where: { id: savedCaseStudy.id },
    relations: ["industry", "service"],
  });

  res.status(201).json(completeCaseStudy);
});

// Update a case study
export const updateCaseStudy = authAsyncHandler(async (req: MulterRequest, res: Response) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const caseStudy = await caseStudyRepo.findOne({ where: { id } });
  if (!caseStudy) {
    return res.status(404).json({ message: "Case study not found" });
  }



  // Update industry if provided
  if (updateData.industryId) {
    const industry = await industryRepo.findOne({ where: { id: updateData.industryId } });
    if (!industry) {
      return res.status(404).json({ message: "Industry not found" });
    }
    updateData.industry = industry;
    delete updateData.industryId;
  }

  // Update service if provided
  if (updateData.serviceId) {
    const service = await serviceRepo.findOne({ where: { id: updateData.serviceId } });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    updateData.service = service;
    delete updateData.serviceId;
  }

  Object.assign(caseStudy, updateData);
  const updatedCaseStudy = await caseStudyRepo.save(caseStudy);

  // Fetch the complete case study with relations
  const completeCaseStudy = await caseStudyRepo.findOne({
    where: { id },
    relations: ["industry", "service"],
  });

  res.json(completeCaseStudy);
});

// Delete a case study
export const deleteCaseStudy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const caseStudy = await caseStudyRepo.findOne({ where: { id } });
  if (!caseStudy) {
    return res.status(404).json({ message: "Case study not found" });
  }

  await caseStudyRepo.remove(caseStudy);
  res.json({ message: "Case study deleted successfully" });
});

// Get case studies by industry
export const getCaseStudiesByIndustry = asyncHandler(async (req: Request, res: Response) => {
  const { industryId } = req.params;

  const industry = await industryRepo.findOne({ where: { id: industryId } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  const caseStudies = await caseStudyRepo.find({
    where: { industry: { id: industryId } },
    relations: ["industry", "service"],
    order: { displayOrder: "ASC", createdAt: "DESC" },
  });

  res.json(caseStudies);
});

// Get case studies by service
export const getCaseStudiesByService = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;

  const service = await serviceRepo.findOne({ where: { id: serviceId } });
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const caseStudies = await caseStudyRepo.find({
    where: { service: { id: serviceId } },
    relations: ["industry", "service"],
    order: { displayOrder: "ASC", createdAt: "DESC" },
  });

  res.json(caseStudies);
});

// Get case studies by impact level
export const getCaseStudiesByImpact = asyncHandler(async (req: Request, res: Response) => {
  const { impact } = req.params;

  if (!Object.values(CaseStudyImpact).includes(impact as CaseStudyImpact)) {
    return res.status(400).json({ 
      message: "Invalid impact level. Must be one of: Low, Medium, High, Transformational" 
    });
  }

  const caseStudies = await caseStudyRepo.find({
    where: { impact: impact as CaseStudyImpact },
    relations: ["industry", "service"],
    order: { displayOrder: "ASC", createdAt: "DESC" },
  });

  res.json(caseStudies);
});

// Update case study display order
export const updateCaseStudyOrder = asyncHandler(async (req: Request, res: Response) => {
  const { caseStudies } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(caseStudies)) {
    return res.status(400).json({ message: "Case studies must be an array" });
  }

  const updatePromises = caseStudies.map(({ id, displayOrder }) =>
    caseStudyRepo.update(id, { displayOrder })
  );

  await Promise.all(updatePromises);

  res.json({ message: "Display order updated successfully" });
});

// Toggle case study active status
export const toggleCaseStudyStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const caseStudy = await caseStudyRepo.findOne({ where: { id } });
  if (!caseStudy) {
    return res.status(404).json({ message: "Case study not found" });
  }

  caseStudy.isActive = !caseStudy.isActive;
  await caseStudyRepo.save(caseStudy);

  res.json({ message: `Case study ${caseStudy.isActive ? "activated" : "deactivated"} successfully` });
});

// Get case study statistics
export const getCaseStudyStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalCaseStudies, industryCaseStudies, serviceCaseStudies] = await Promise.all([
    caseStudyRepo.count(),
    caseStudyRepo.count({ where: { industry: { id: req.params.industryId } } }),
    caseStudyRepo.count({ where: { service: { id: req.params.serviceId } } }),
  ]);

  const impactStats = await Promise.all(
    Object.values(CaseStudyImpact).map(async (impact) => ({
      impact,
      count: await caseStudyRepo.count({ where: { impact } }),
    }))
  );

  res.json({
    total: totalCaseStudies,
    byType: {
      industry: industryCaseStudies,
      service: serviceCaseStudies,
    },
    byImpact: impactStats,
  });
});

// Get featured case studies
export const getFeaturedCaseStudies = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 6 } = req.query;

  const caseStudies = await caseStudyRepo.find({
    where: { isActive: true },
    relations: ["industry", "service"],
    order: { displayOrder: "ASC", createdAt: "DESC" },
    take: Number(limit),
  });

  res.json(caseStudies);
});
