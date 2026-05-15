import express from "express";
import { protectRoute } from "../middlewear/protectRoute.js";
import { adminLogin, accept_application, accepted_applications, activateAccount, client_info, deactivateAccount, display_pending_jobs, get_analytics, get_booking_form, reject_application, rejected_applications, search_job_accepted, search_job_pending, search_job_rejected, view_user_profile, worker_info, allot_worker_to_client, get_all_users, toggle_user_status, report_worker, get_complaints, resolve_complaint, get_pending_hire_requests, reject_hire_request, approve_cancel_request, reject_cancel_request } from "../controller/admin.controller.js";

const Router=express.Router();

// Admin login without protection
Router.post('/login', adminLogin);

Router.get('/display_pending_jobs',protectRoute,display_pending_jobs);

Router.post('/accept_application',protectRoute,accept_application);

Router.post('/reject_application',protectRoute,reject_application);

Router.get('/accepted_applications',protectRoute,accepted_applications);

Router.get('/rejected_applications',protectRoute,rejected_applications);

Router.get('/search_job_accepted',protectRoute,search_job_accepted);

Router.get('/search_job_rejected',protectRoute,search_job_rejected);

Router.get('/search_job_pending',protectRoute,search_job_pending);

Router.get('/worker_info',protectRoute,worker_info);

Router.get('/view_user_profile/:userId',protectRoute,view_user_profile);

Router.get('/client_info',protectRoute,client_info);

Router.get('/get_booking_form/:jobId',protectRoute,get_booking_form);

Router.get('/deactivateAccount/:userId',protectRoute,deactivateAccount);

Router.get('/activateAccount/:userId',protectRoute,activateAccount);

// Pending hire requests - admin can approve/reject on behalf of worker
Router.get('/pending_hire_requests', protectRoute, get_pending_hire_requests);

Router.post('/approve_hire_request', protectRoute, allot_worker_to_client);

Router.post('/reject_hire_request', protectRoute, reject_hire_request);

// Cancellation request moderation
Router.post('/approve_cancel_request', protectRoute, approve_cancel_request);

Router.post('/reject_cancel_request', protectRoute, reject_cancel_request);

// User management
Router.get('/all_users', protectRoute, get_all_users);

Router.post('/toggle_user_status/:userId', protectRoute, toggle_user_status);

// Complaint management
Router.post('/report_worker', protectRoute, report_worker);

Router.get('/complaints', protectRoute, get_complaints);

Router.post('/resolve_complaint', protectRoute, resolve_complaint);

Router.get('/analytics', protectRoute, get_analytics);

export default Router;