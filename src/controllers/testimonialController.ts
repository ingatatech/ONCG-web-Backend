import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Testimonial } from "../entities/Testimonial";
import { uploadImage } from "../utils/uploadImage";

const testimonialRepo = AppDataSource.getRepository(Testimonial);

// Create a testimonial
export const createTestimonial = async (req: any, res: Response) => {
  try {
    const { leaderName, companyName, role, quote } = req.body;

  
    let leaderImage = "";
    if (req.file) {
      leaderImage = await uploadImage(req.file.path);
    }

    const testimonial = testimonialRepo.create({
      leaderName,
      companyName,
      role,
      quote,
      leaderImage,
      approved: false,
    });

    await testimonialRepo.save(testimonial);
    res.status(201).json(testimonial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create testimonial", error });
  }
};




export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await testimonialRepo.find({
      order: { createdAt: "DESC" },
    });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving testimonials", error });
  }
};

export const updateApprovalStatus = async (req: Request, res: Response) => {
  try {
    const { approved } = req.body;
    const { id } = req.params;

    const testimonial = await testimonialRepo.findOneBy({ id });
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    testimonial.approved = approved;
    await testimonialRepo.save(testimonial);

    res.status(200).json({ message: `Testimonial ${approved ? "approved" : "rejected"}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await testimonialRepo.findOneBy({ id });
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    await testimonialRepo.remove(testimonial);
    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete testimonial", error });
  }
};
export const updateTestimonial = async (req: any, res: Response) => {
  try {
    const { leaderName, companyName, role, quote } = req.body;
    const { id } = req.params;

    const testimonial = await testimonialRepo.findOneBy({ id });
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Update fields if provided
    if (leaderName) testimonial.leaderName = leaderName;
    if (companyName) testimonial.companyName = companyName;
    if (role) testimonial.role = role;
    if (quote) testimonial.quote = quote;

    // Optional: update image
    if (req.file) {
      const imageUrl = await uploadImage(req.file.path);
      testimonial.leaderImage = imageUrl;
    }

    await testimonialRepo.save(testimonial);
    res.status(200).json({ message: "Testimonial updated", testimonial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating testimonial", error });
  }
};
