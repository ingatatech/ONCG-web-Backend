// User controller functions will go here

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ContactMessage } from "../entities/ContactMessage";
import { Expert } from "../entities/Expert";
import { Industry } from "../entities/Industry";
import { Insight } from "../entities/Insight";
import { Partners } from "../entities/Partners";
import { Service } from "../entities/Service";
import { ServiceCategory } from "../entities/ServiceCategory";
import { Subscriber } from "../entities/Subscriber";
import { Testimonial } from "../entities/Testimonial";

const userRepo = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const existing = await userRepo.findOneBy({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ email, password: hashed, name });
    await userRepo.save(user);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userRepo.findOneBy({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.userId should be set by auth middleware
    const userId = (req as any).userId;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Profile error", error: err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name } = req.body;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.name = name;
    await userRepo.save(user);
    res.json({ message: "Profile updated", name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await userRepo.save(user);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err });
  }
};


export const getStatistics = async (req: Request, res: Response) => {
  try {
    // Get total counts
    const contactMessageCount = await AppDataSource.getRepository(ContactMessage).count();
    const expertCount = await AppDataSource.getRepository(Expert).count();
    const industryCount = await AppDataSource.getRepository(Industry).count();
    const insightCount = await AppDataSource.getRepository(Insight).count();
    const partnersCount = await AppDataSource.getRepository(Partners).count();
    const serviceCount = await AppDataSource.getRepository(Service).count();
    const serviceCategoryCount = await AppDataSource.getRepository(ServiceCategory).count();
    const subscriberCount = await AppDataSource.getRepository(Subscriber).count();
    const testimonialCount = await AppDataSource.getRepository(Testimonial).count();

    // Get monthly data for the current year
    const currentYear = new Date().getFullYear();
    const monthlyData = await getMonthlyStatistics(currentYear);

    // Get yearly statistics (last 5 years including current year)
    const yearlyData = await getYearlyStatistics();

    res.json({
      totals: {
        contactMessages: contactMessageCount,
        experts: expertCount,
        industries: industryCount,
        insights: insightCount,
        partners: partnersCount,
        services: serviceCount,
        serviceCategories: serviceCategoryCount,
        subscribers: subscriberCount,
        testimonials: testimonialCount,
      },
      monthly: monthlyData,
      yearly: yearlyData,
      currentYear: currentYear
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch statistics", error: err });
  }
};

// Helper function to get monthly statistics
const getMonthlyStatistics = async (year: number) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthlyStats = await Promise.all(
    months.map(async (month) => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const [
        contactMessageCount,
        expertCount,
        industryCount,
        insightCount,
        partnersCount,
        serviceCount,
        serviceCategoryCount,
        subscriberCount,
        testimonialCount
      ] = await Promise.all([
        AppDataSource.getRepository(ContactMessage)
          .createQueryBuilder("contactMessage")
          .where("contactMessage.createdAt >= :startDate AND contactMessage.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Expert)
          .createQueryBuilder("expert")
          .where("expert.createdAt >= :startDate AND expert.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Industry)
          .createQueryBuilder("industry")
          .where("industry.createdAt >= :startDate AND industry.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Insight)
          .createQueryBuilder("insight")
          .where("insight.createdAt >= :startDate AND insight.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Partners)
          .createQueryBuilder("partner")
          .where("partner.createdAt >= :startDate AND partner.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Service)
          .createQueryBuilder("service")
          .where("service.createdAt >= :startDate AND service.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(ServiceCategory)
          .createQueryBuilder("serviceCategory")
          .where("serviceCategory.createdAt >= :startDate AND serviceCategory.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Subscriber)
          .createQueryBuilder("subscriber")
          .where("subscriber.createdAt >= :startDate AND subscriber.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Testimonial)
          .createQueryBuilder("testimonial")
          .where("testimonial.createdAt >= :startDate AND testimonial.createdAt <= :endDate", { startDate, endDate })
          .getCount()
      ]);

      return {
        month,
        monthName: new Date(year, month - 1).toLocaleString("en-US", { month: "long" }),
        contactMessages: contactMessageCount,
        experts: expertCount,
        industries: industryCount,
        insights: insightCount,
        partners: partnersCount,
        services: serviceCount,
        serviceCategories: serviceCategoryCount,
        subscribers: subscriberCount,
        testimonials: testimonialCount,
        total:
          contactMessageCount +
          expertCount +
          industryCount +
          insightCount +
          partnersCount +
          serviceCount +
          serviceCategoryCount +
          subscriberCount +
          testimonialCount
      };
    })
  );

  return monthlyStats;
};

// Helper function to get yearly statistics
const getYearlyStatistics = async () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const yearlyStats = await Promise.all(
    years.map(async (year) => {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

      const [
        contactMessageCount,
        expertCount,
        industryCount,
        insightCount,
        partnersCount,
        serviceCount,
        serviceCategoryCount,
        subscriberCount,
        testimonialCount
      ] = await Promise.all([
        AppDataSource.getRepository(ContactMessage)
          .createQueryBuilder("contactMessage")
          .where("contactMessage.createdAt >= :startDate AND contactMessage.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Expert)
          .createQueryBuilder("expert")
          .where("expert.createdAt >= :startDate AND expert.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Industry)
          .createQueryBuilder("industry")
          .where("industry.createdAt >= :startDate AND industry.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Insight)
          .createQueryBuilder("insight")
          .where("insight.createdAt >= :startDate AND insight.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Partners)
          .createQueryBuilder("partner")
          .where("partner.createdAt >= :startDate AND partner.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Service)
          .createQueryBuilder("service")
          .where("service.createdAt >= :startDate AND service.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(ServiceCategory)
          .createQueryBuilder("serviceCategory")
          .where("serviceCategory.createdAt >= :startDate AND serviceCategory.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Subscriber)
          .createQueryBuilder("subscriber")
          .where("subscriber.createdAt >= :startDate AND subscriber.createdAt <= :endDate", { startDate, endDate })
          .getCount(),

        AppDataSource.getRepository(Testimonial)
          .createQueryBuilder("testimonial")
          .where("testimonial.createdAt >= :startDate AND testimonial.createdAt <= :endDate", { startDate, endDate })
          .getCount()
      ]);

      return {
        year,
        contactMessages: contactMessageCount,
        experts: expertCount,
        industries: industryCount,
        insights: insightCount,
        partners: partnersCount,
        services: serviceCount,
        serviceCategories: serviceCategoryCount,
        subscribers: subscriberCount,
        testimonials: testimonialCount,
        total:
          contactMessageCount +
          expertCount +
          industryCount +
          insightCount +
          partnersCount +
          serviceCount +
          serviceCategoryCount +
          subscriberCount +
          testimonialCount
      };
    })
  );

  return yearlyStats.reverse();
};
