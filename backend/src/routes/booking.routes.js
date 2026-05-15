import express from "express"
import { protectRoute } from "../middlewear/protectRoute.js";
import { accept_job, cancel_booking, create, delete_application, get_booking_timeline, get_completed_jobs, get_job_offer, get_recruited_staff, reject_job, reschedule_booking } from "../controller/booking.controller.js";

const Router=express.Router();

Router.post('/create',protectRoute,create);
Router.get('/get_recruited_staff',protectRoute,get_recruited_staff);
Router.get('/get_job_offer',protectRoute,get_job_offer);
Router.put('/accept_job/:bookingId',protectRoute,accept_job);
Router.put('/reject_job/:bookingId',protectRoute,reject_job);
Router.put('/cancel/:bookingId',protectRoute,cancel_booking);
Router.put('/reschedule/:bookingId',protectRoute,reschedule_booking);
Router.delete('/delete_application/:booking_id',protectRoute,delete_application);
Router.get('/get_completed_jobs',protectRoute,get_completed_jobs);
Router.get('/timeline/:bookingId',protectRoute,get_booking_timeline);

export default Router;