import express from "express";
import { protectRoute } from "../middlewear/protectRoute.js";
import { create, deleteReview, fetch_details, get_review_overview } from "../controller/reviews.controller.js";
const Router=express.Router();

Router.get("/fetch_details",protectRoute,fetch_details);

Router.post("/create",protectRoute,create);

Router.get("/get_review_overview",protectRoute,get_review_overview);

Router.put("/deleteReview/:bookingId",protectRoute,deleteReview);

export default Router;