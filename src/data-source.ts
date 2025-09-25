import "dotenv/config";
import { DataSource } from "typeorm";
import { Insight } from "./entities/Insight";
import { User } from "./entities/User";
import { ContactMessage } from "./entities/ContactMessage";
import { Industry } from "./entities/Industry";
import { Service } from "./entities/Service";
import { ServiceCategory } from "./entities/ServiceCategory";
import { Testimonial } from "./entities/Testimonial";
// import { Leaders } from "./entities/Leaders";
import { CaseStudy } from "./entities/CaseStudy";
import { Expert } from "./entities/Expert";
import { Partners } from "./entities/Partners";
import { Subscriber } from "./entities/Subscriber";



export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_URL,
  synchronize: true, // Set to false in production
  logging: true,

  entities: [
    Insight,
    User,
    ContactMessage,
    Testimonial,
    CaseStudy,
    Insight,
    Expert,
    Partners,
    Subscriber,
    Industry,Service,ServiceCategory,
  ],
  migrations: [__dirname + "/migrations/*.ts"],
  ssl: { rejectUnauthorized: false },
});
