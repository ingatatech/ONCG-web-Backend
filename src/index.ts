import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import cors from "cors";
import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes";
import messagesRoutes from "./routes/contactMessageRoutes";
import partnersRoutes from "./routes/partnersRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import caseStudiesRoutes from "./routes/caseStudyRoutes";
import insightsRoutes from "./routes/insightRoutes";
import industryRoutes from "./routes/industryRoutes";
import servicesRoutes from "./routes/serviceRoutes";
import subscriberRoutes from "./routes/subscriberRoutes";
import expertsRoutes from "./routes/expertsRoutes";


const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/contact-messages", messagesRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/case-studies", caseStudiesRoutes);
app.use("/api/industries", industryRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/experts", expertsRoutes);

app.get("/", (req, res) => {
  res.send("ONCG API is running!");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
