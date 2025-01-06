import express from "express";
import { getAllGovtJobs, getASingleGovtJob } from "../controllers/govtJobController.js";

const router = express.Router();

router.get("/getall", getAllGovtJobs);
router.get("/get/:id", getASingleGovtJob);

export default router;

