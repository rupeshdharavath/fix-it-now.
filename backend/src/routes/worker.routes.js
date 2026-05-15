import express from "express";
import { protectRoute } from "../middlewear/protectRoute.js";
import { createWorkerProfile, delete_application, delete_job_worker, display_accepted_jobs, get_all_workers, get_available_workers, particular_worker_detail, search_job} from "../controller/worker.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createWorkerProfile);

router.get("/display_accepted_jobs",protectRoute,display_accepted_jobs);

router.get("/get_all_workers",protectRoute,get_all_workers);

router.get("/get_available_workers",protectRoute,get_available_workers);

router.get("/particular_worker_detail/:jobId",protectRoute,particular_worker_detail);

router.get("/search_job/:search",protectRoute,search_job);

router.delete("/delete_application/:appId",protectRoute,delete_application);

router.delete("/delete_job_worker/:appId",protectRoute,delete_job_worker);

export default router;
