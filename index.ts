import express from "express";
import "reflect-metadata";
import cors from "cors";
import bodyParser from "body-parser";

import userRoutes from "./src/routes/userRoutes";
import messagesRoutes from "./src/routes/contactMessageRoutes";
import partnersRoutes from "./src/routes/partnersRoutes";
import testimonialRoutes from "./src/routes/testimonialRoutes";
import caseStudiesRoutes from "./src/routes/caseStudyRoutes";
import insightsRoutes from "./src/routes/insightRoutes";
import industryRoutes from "./src/routes/industryRoutes";
import servicesRoutes from "./src/routes/serviceRoutes";
import subscriberRoutes from "./src/routes/subscriberRoutes";
import expertsRoutes from "./src/routes/expertsRoutes";
import leadersRoutes from "./src/routes/leaderRoutes";
import affiliationsRoutes from "./src/routes/affliationsRoutes";
import { AppDataSource } from "./src/data-source";


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
app.use("/api/leaders", leadersRoutes);
app.use("/api/affiliations", affiliationsRoutes);

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
