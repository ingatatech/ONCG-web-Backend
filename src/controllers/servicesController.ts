import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Service } from "../entities/Service";
import { ServiceCategory } from "../entities/ServiceCategory";
import { CaseStudy } from "../entities/CaseStudy";
import { Expert } from "../entities/Expert";
import { asyncHandler, authAsyncHandler } from "../utils/asyncHandler";
import { validationResult } from "express-validator";

const serviceRepo = AppDataSource.getRepository(Service);
const categoryRepo = AppDataSource.getRepository(ServiceCategory);
const caseStudyRepo = AppDataSource.getRepository(CaseStudy);
const expertRepo = AppDataSource.getRepository(Expert);

// Get all services with filtering and pagination
export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const {
    category,
    isActive,
    page = "1",
    limit = "50",
    sortBy = "sortOrder",
    sortOrder = "asc",
    search,
  } = req.query;

  // Parse numbers safely
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const skip = (pageNumber - 1) * limitNumber;

  const queryBuilder = serviceRepo
    .createQueryBuilder("service")
    .leftJoinAndSelect("service.category", "category") // alias simplified
    .leftJoinAndSelect("service.experts", "experts") 
    .leftJoinAndSelect("service.caseStudies", "caseStudies");

  // Filter by category slug
  if (category) {
    queryBuilder.andWhere("category.slug = :category", { category });
  }

  // Filter by isActive
  if (isActive === "true" || isActive === "false") {
    queryBuilder.andWhere("service.isActive = :isActive", { isActive: isActive === "true" });
  }

  // Search by name or description (PostgreSQL ILIKE)
  if (search) {
    queryBuilder.andWhere(
      "(service.name ILIKE :search OR service.serviceDescription ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  // Sorting
  const validSortFields = ["name", "sortOrder", "isActive", "createdAt"];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy : "sortOrder";
  const order: "ASC" | "DESC" = sortOrder === "desc" ? "DESC" : "ASC";
  queryBuilder.orderBy(`service.${sortField}`, order);

  // Pagination
  queryBuilder.skip(skip).take(limitNumber);

  // Fetch results and total count
  const [services, total] = await queryBuilder.getManyAndCount();

  res.json({
    success: true,
    data: services,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  });
});


// Get a single service by ID
export const getService = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const service = await serviceRepo.findOne({
    where: { id },
    relations: ["category", "experts", "caseStudies"],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  res.json({
    success: true,
    data: service,
  });
});

// Get service by slug
export const getServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { slug } = req.params;

  const service = await serviceRepo.findOne({
    where: { slug },
    relations: ["category", "experts", "caseStudies"],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  res.json({
    success: true,
    data: service,
  });
});

// Create a new service
export const createService = authAsyncHandler(async (req: Request, res: Response) => {
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
    slug,
    serviceDescription,
    categoryId,
    expertIds = [],
    isActive = true,
    caseStudies = [],
  } = req.body;

  // Check if slug already exists
  const existingService = await serviceRepo.findOne({ where: { slug } });
  if (existingService) {
    return res.status(400).json({
      success: false,
      message: "Service with this Name already exists",
    });
  }

  // Verify category exists
  const category = await categoryRepo.findOne({ where: { id: categoryId } });
  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Category not found",
    });
  }

  // Verify experts exist
  let experts: Expert[] = [];
  if (expertIds.length > 0) {
    experts = await expertRepo.findByIds(expertIds);
    if (experts.length !== expertIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more experts not found",
      });
    }
  }
  const { max: maxServiceOrder } = await serviceRepo
    .createQueryBuilder("service")
    .select("MAX(service.sortOrder)", "max")
    .getRawOne();
  const nextServiceSortOrder = (maxServiceOrder ?? 0) + 1;

  const service = serviceRepo.create({
    name,
    slug,
    serviceDescription,
    category,
    experts,
    isActive,
    sortOrder: nextServiceSortOrder,
  });

  const savedService = await serviceRepo.save(service);

  // Optionally create case studies for this service
  if (Array.isArray(caseStudies) && caseStudies.length > 0) {
    const { max: maxCaseStudyOrder } = await caseStudyRepo
      .createQueryBuilder("caseStudy")
      .select("MAX(caseStudy.displayOrder)", "max")
      .where("caseStudy.serviceId = :serviceId", { serviceId: savedService.id })
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
          service: savedService,
        }),
      );
    if (newCaseStudies.length > 0) {
      await caseStudyRepo.save(newCaseStudies);
    }
  }


  // Fetch the complete service with relations
  const completeService = await serviceRepo.findOne({
    where: { id: savedService.id },
    relations: ["category", "experts",  "caseStudies"],
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: completeService,
  });
});

// Update a service
export const updateService = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const updateData = { ...req.body };

  const service = await serviceRepo.findOne({
    where: { id },
    relations: ["category", "experts"],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  // Check if new slug conflicts with existing service
  if (updateData.slug && updateData.slug !== service.slug) {
    const existingService = await serviceRepo.findOne({ where: { slug: updateData.slug } });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service with this slug already exists",
      });
    }
  }

  // Handle category update
  if (updateData.categoryId) {
    const category = await categoryRepo.findOne({ where: { id: updateData.categoryId } });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }
    service.category = category;
    delete updateData.categoryId;
  }

  // Handle experts update
  if (updateData.expertIds !== undefined) {
    if (updateData.expertIds.length > 0) {
      const experts: Expert[] = await expertRepo.findByIds(updateData.expertIds);
      if (experts.length !== updateData.expertIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more experts not found",
        });
      }
      service.experts = experts;
    } else {
      service.experts = [];
    }
    delete updateData.expertIds;
  }

  Object.assign(service, updateData);
  await serviceRepo.save(service);

  // Fetch the complete service with relations
  const completeService = await serviceRepo.findOne({
    where: { id },
    relations: ["category", "experts", "caseStudies"],
  });

  res.json({
    success: true,
    message: "Service updated successfully",
    data: completeService,
  });
});

// Delete a service
export const deleteService = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const service = await serviceRepo.findOne({ where: { id } });
  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  await serviceRepo.remove(service);

  res.json({
    success: true,
    message: "Service deleted successfully",
  });
});

// Get service experts
export const getServiceExperts = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const service = await serviceRepo.findOne({
    where: { id },
    relations: ["experts"],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  res.json({
    success: true,
    data: service.experts,
  });
});

// Add expert to service
export const addExpertToService = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const { expertId } = req.body;

  const service = await serviceRepo.findOne({
    where: { id },
    relations: ["experts"],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  const expert = await expertRepo.findOne({ where: { id: expertId } });
  if (!expert) {
    return res.status(404).json({
      success: false,
      message: "Expert not found",
    });
  }

  // Check if expert is already assigned to this service
  const isAlreadyAssigned = service.experts.some((exp) => exp.id === expertId);
  if (isAlreadyAssigned) {
    return res.status(400).json({
      success: false,
      message: "Expert is already assigned to this service",
    });
  }

  service.experts.push(expert);
  await serviceRepo.save(service);

  res.json({
    success: true,
    message: "Expert added to service successfully",
  });
});

// Remove expert from service
export const removeExpertFromService = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id, expertId } = req.params;

  const service = await serviceRepo.findOne({
    where: { id },
    relations: ["experts"],
  });

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  service.experts = service.experts.filter((expert) => expert.id !== expertId);
  await serviceRepo.save(service);

  res.json({
    success: true,
    message: "Expert removed from service successfully",
  });
});

// Get service case studies
export const getServiceCaseStudies = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const caseStudies = await caseStudyRepo.find({
    where: { service: { id } },
    relations: ["service"],
    order: { createdAt: "DESC" },
  });

  res.json({
    success: true,
    data: caseStudies,
  });
});



// Toggle service active status
export const toggleServiceStatus = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const service = await serviceRepo.findOne({ where: { id } });
  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  service.isActive = !service.isActive;
  await serviceRepo.save(service);

  res.json({
    success: true,
    message: `Service ${service.isActive ? "activated" : "deactivated"} successfully`,
  });
});

// Get service statistics
export const getServiceStats = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const service = await serviceRepo.findOne({ where: { id } });
  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  const [expertCount, caseStudyCount] = await Promise.all([
    serviceRepo
      .createQueryBuilder("service")
      .leftJoin("service.experts", "expert")
      .where("service.id = :id", { id })
      .getCount(),
    caseStudyRepo.count({ where: { service: { id } } }),
  ]);

  res.json({
    success: true,
    data: {
      service: {
        id: service.id,
        name: service.name,
        slug: service.slug,
      },
      stats: {
        experts: expertCount,
        caseStudies: caseStudyCount,
      },
    },
  });
});

// Category Management Functions

// Get all categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryRepo.find({
    order: { sortOrder: "ASC", name: "ASC" },
  });

  res.json({
    success: true,
    data: categories,
  });
});

// Create a new category
export const createCategory = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { name, slug, description, isActive = true,} = req.body;

  // Check if slug already exists
  const existingCategory = await categoryRepo.findOne({ where: { slug } });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: "Category with this slug already exists",
    });
  }
const { max: maxCategoryOrder } = await categoryRepo
  .createQueryBuilder("category")
  .select("MAX(category.sortOrder)", "max")
  .getRawOne();
const nextCategorySortOrder = (maxCategoryOrder ?? 0) + 1;
  const category = categoryRepo.create({
    name,
    slug,
    description,
    isActive,
    sortOrder: nextCategorySortOrder,
  });

  const savedCategory = await categoryRepo.save(category);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: savedCategory,
  });
});

// Update a category
export const updateCategory = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const updateData = { ...req.body };

  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  // Check if new slug conflicts with existing category
  if (updateData.slug && updateData.slug !== category.slug) {
    const existingCategory = await categoryRepo.findOne({ where: { slug: updateData.slug } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }
  }

  Object.assign(category, updateData);
  const updatedCategory = await categoryRepo.save(category);

  res.json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

// Delete a category
export const deleteCategory = authAsyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const category = await categoryRepo.findOne({ where: { id } });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  await categoryRepo.remove(category);

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

export const reorderCategories= asyncHandler(async (req: Request, res: Response) => { const { categoryIds } = req.body 
if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
   return res.status(400).json({ success: false, message: "Category IDs array is required", }) } 
   try { 
  // Update each categories's sort order based on their position in the array 
  const updatePromises = categoryIds.map((categoryId: string, index: number) => { return categoryRepo.update({ id: categoryId }, { sortOrder: index + 1 }) }) 
  await Promise.all(updatePromises)
  res.json({ success: true, message: "categories reordered successfully", }) 
} catch (error) { res.status(500).json({ success: false, message: "Error reordering experts", error: error instanceof Error ? error.message : "Unknown error", }) } })