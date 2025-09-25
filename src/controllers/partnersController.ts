import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Partners } from "../entities/Partners";
import { uploadImage } from "../utils/uploadImage";

const partnerRepo = AppDataSource.getRepository(Partners);

interface MulterRequest extends Request {
  file?: any;
}

// GET all partners
export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const partners = await partnerRepo.find({
      order: { createdAt: "DESC" },
    });
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: "Error fetching partners", error });
  }
};

// GET single partner by ID
export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const partner = await partnerRepo.findOneBy({ id: req.params.id });
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: "Error fetching partner", error });
  }
};

// CREATE new partner
export const createPartner = async (req: MulterRequest, res: Response) => {
  try {
      const { name } = req.body;
      let imageUrl = "";
        if (req.file) {
          imageUrl = await uploadImage(req.file.path);
        }
    const newPartner = partnerRepo.create({ name:name,image:imageUrl });
    await partnerRepo.save(newPartner);
    res.status(201).json(newPartner);
  } catch (error:any) {
    console.log(error)
    res.status(500).json({ message: "Error creating partner", error });
  }
};

// UPDATE a partner
export const updatePartner = async (req: MulterRequest, res: Response) => {
  try {
    const {name}=req.body
    const partner = await partnerRepo.findOneBy({ id: req.params.id });
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    if (name) partner.name = name;
     if (req.file) {
    partner.image = await uploadImage(req.file.path);
    }
    await partnerRepo.save(partner);
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: "Error updating partner", error });
  }
};

// DELETE a partner
export const deletePartner = async (req: Request, res: Response) => {
  try {
    const partner = await partnerRepo.findOneBy({ id: req.params.id });
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    await partnerRepo.remove(partner);
    res.status(200).json({ message: "Partner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting partner", error });
  }
};
