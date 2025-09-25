import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Industry } from "../entities/Industry";
import { Expert } from "../entities/Expert";
import { CaseStudy } from "../entities/CaseStudy";
import { Insight } from "../entities/Insight";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";

const industryRepo = AppDataSource.getRepository(Industry);
const expertRepo = AppDataSource.getRepository(Expert);
const caseStudyRepo = AppDataSource.getRepository(CaseStudy);
const insightRepo = AppDataSource.getRepository(Insight);

// Get all industries with optional filtering and pagination
export const getIndustries = asyncHandler(async (req: Request, res: Response) => {
  const {
    isActive,
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    search,
  } = req.query;

  const queryBuilder = industryRepo
    .createQueryBuilder("industry")
    .leftJoinAndSelect("industry.experts", "experts")
    .leftJoinAndSelect("industry.caseStudies", "caseStudies")
    .leftJoinAndSelect("industry.insights", "insights");

  // Apply filters
  if (isActive !== undefined) {
    queryBuilder.andWhere("industry.isActive = :isActive", { isActive: isActive === "true" });
  }

  if (search) {
    queryBuilder.andWhere(
      "(industry.name ILIKE :search OR industry.industryDescription ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Apply sorting
  const validSortFields = ["name", "slug", "isActive", "createdAt"];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : "name";
  const order = sortOrder === "desc" ? "DESC" : "ASC";
  queryBuilder.orderBy(`industry.${sortField}`, order);

  // Apply pagination
  const skip = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(skip).take(Number(limit));

  const [industries, total] = await queryBuilder.getManyAndCount();

  res.json({
    industries,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// Get a single industry by ID
export const getIndustry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({
    where: { id },
    relations: ["experts", "caseStudies", "insights"],
  });

  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  res.json(industry);
});

// Get industry by slug
export const getIndustryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const industry = await industryRepo.findOne({
    where: { slug },
    relations: ["experts", "caseStudies", "insights"],
  });

  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  res.json(industry);
});

// Create a new industry
export const createIndustry = authAsyncHandler(async (req: Request, res: Response) => {
  const { name, slug, industryDescription, isActive = true, expertIds = [], caseStudies = [] } = req.body;

  // Check if slug already exists
  const existingIndustry = await industryRepo.findOne({ where: { slug } });
  if (existingIndustry) {
    return res.status(400).json({ message: "Industry with this slug already exists" });
  }

  let experts: Expert[] = [];
  if (Array.isArray(expertIds) && expertIds.length > 0) {
    experts = await expertRepo.findByIds(expertIds);
    if (experts.length !== expertIds.length) {
      return res.status(400).json({ message: "One or more experts not found" });
    }
  }

  const industry = industryRepo.create({
    name,
    slug,
    industryDescription,
    isActive,
    experts,
  });

  const savedIndustry = await industryRepo.save(industry);

  // Fetch the complete industry with relations
  // Optionally create case studies for this industry
  if (Array.isArray(caseStudies) && caseStudies.length > 0) {
    const { max: maxCaseStudyOrder } = await caseStudyRepo
      .createQueryBuilder("caseStudy")
      .select("MAX(caseStudy.displayOrder)", "max")
      .where("caseStudy.industryId = :industryId", { industryId: savedIndustry.id })
      .getRawOne();
    let nextDisplayOrder = (maxCaseStudyOrder ?? 0) + 1;

    const newCaseStudies = caseStudies
      .filter((cs: any) => cs && cs.title && cs.description)
      .map((cs: any) =>
        caseStudyRepo.create({
          title: cs.title,
          description: cs.description,
          impact: cs.impact ?? "Medium",
          isActive: cs.isActive ?? true,
          displayOrder: cs.displayOrder ?? nextDisplayOrder++,
          industry: savedIndustry,
        }),
      );
    if (newCaseStudies.length > 0) {
      await caseStudyRepo.save(newCaseStudies);
    }
  }

  const completeIndustry = await industryRepo.findOne({
    where: { id: savedIndustry.id },
    relations: ["experts", "caseStudies", "insights"],
  });

  res.status(201).json(completeIndustry);
});

// Update an industry
export const updateIndustry = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const industry = await industryRepo.findOne({ where: { id }, relations: ["experts"] });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  // Check if new slug conflicts with existing industry
  if (updateData.slug && updateData.slug !== industry.slug) {
    const existingIndustry = await industryRepo.findOne({ where: { slug: updateData.slug } });
    if (existingIndustry) {
      return res.status(400).json({ message: "Industry with this slug already exists" });
    }
  }

  Object.assign(industry, updateData);
  const updatedIndustry = await industryRepo.save(industry);

  // Fetch the complete industry with relations
  const completeIndustry = await industryRepo.findOne({
    where: { id },
    relations: ["experts", "caseStudies", "insights"],
  });

  res.json(completeIndustry);
});

// Delete an industry
export const deleteIndustry = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({ where: { id } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  await industryRepo.remove(industry);
  res.json({ message: "Industry deleted successfully" });
});

// Get industry experts
export const getIndustryExperts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({ where: { id } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  res.json(industry.experts);
});

// Add expert to industry
export const addExpertToIndustry = authAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { expertId } = req.body;

  const industry = await industryRepo.findOne({ where: { id }, relations: ["experts"] });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  const expert = await expertRepo.findOne({ where: { id: expertId } });
  if (!expert) {
    return res.status(404).json({ message: "Expert not found" });
  }

  const already = industry.experts?.some((e) => e.id === expertId);
  if (already) {
    return res.status(400).json({ message: "Expert is already assigned to this industry" });
  }

  industry.experts = [...(industry.experts || []), expert];
  await industryRepo.save(industry);

  const completeIndustry = await industryRepo.findOne({ where: { id }, relations: ["experts"] });
  res.status(201).json(completeIndustry);
});

// Remove expert from industry
export const removeExpertFromIndustry = authAsyncHandler(async (req: Request, res: Response) => {
  const { id, expertId } = req.params;

  const industry = await industryRepo.findOne({ where: { id }, relations: ["experts"] });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  industry.experts = (industry.experts || []).filter((e) => e.id !== expertId);
  await industryRepo.save(industry);

  const completeIndustry = await industryRepo.findOne({ where: { id }, relations: ["experts"] });
  res.json(completeIndustry);
});

// Get industry case studies
export const getIndustryCaseStudies = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({ where: { id } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  const caseStudies = await caseStudyRepo.find({
    where: { industry: { id } },
    relations: ["industry"],
    order: { createdAt: "DESC" },
  });

  res.json(caseStudies);
});

// Get industry insights
export const getIndustryInsights = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({ where: { id } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  const insights = await insightRepo.find({
    where: { industry: { id } },
    relations: ["industry"],
    order: { createdAt: "DESC" },
  });

  res.json(insights);
});

// Toggle industry active status
export const toggleIndustryStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({ where: { id } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  industry.isActive = !industry.isActive;
  await industryRepo.save(industry);

  res.json({ message: `Industry ${industry.isActive ? "activated" : "deactivated"} successfully` });
});

// Get industry statistics
export const getIndustryStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const industry = await industryRepo.findOne({ where: { id } });
  if (!industry) {
    return res.status(404).json({ message: "Industry not found" });
  }

  const expertCountPromise = industryRepo
    .createQueryBuilder("industry")
    .leftJoin("industry.experts", "expert")
    .where("industry.id = :id", { id })
    .select("COUNT(expert.id)", "count")
    .getRawOne();

  const caseStudyCountPromise = caseStudyRepo.count({ where: { industry: { id } } });
  const insightCountPromise = insightRepo.count({ where: { industry: { id } } });

  const [{ count: expertCountRaw }, caseStudyCount, insightCount] = await Promise.all([
    expertCountPromise,
    caseStudyCountPromise,
    insightCountPromise,
  ]);
  const expertCount = parseInt(expertCountRaw ?? "0", 10);

  res.json({
    industry: {
      id: industry.id,
      name: industry.name,
      slug: industry.slug,
    },
    stats: {
      experts: expertCount,
      caseStudies: caseStudyCount,
      insights: insightCount,
    },
  });
});

