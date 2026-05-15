import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Update_profile from './components/Update_profile';
import Apply_for_job from './components/Apply_for_job';
import View_worker_application from './components/View_worker_application';
import Book_slot from './components/Book_slot';
import Recruited from './components/Recruited';
import Accepted_applications from './components/Accepted_applications';
import Rejected_applications from './components/Rejected_applications';
import Write_review from './components/Write_review';
import Pending_requests from './components/Pending_requests';
import Pending_worker_jobs from './components/Pending_worker_jobs';
import Rejected_worker_jobs from './components/Rejected_worker_jobs';
import Job_offers from './components/Job_offers';
import Accept_job_offers from './components/Accepted_job_offers';
import Rejected_job_offers from './components/Rejected_job_offers';
import Workers_info from './components/Workers_info';
import User_profile from './components/User_profile';
import Clients_info from './components/Clients_info';
import Booking_form from './components/booking_form';
import Completed_jobs from './components/Completed_jobs';
import Admin_management from './components/Admin_management';
import Allot_worker from './components/Allot_worker';
import Admin_complaints from './components/Admin_complaints';
import Notifications from './components/Notifications';
function App() {
  return(
    <div className="app-shell">
        <Navbar/>
        <main className="pt-24 pb-12">
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/admin-access' element={<AdminLogin/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/update_profile' element={<Update_profile/>}/>
          <Route path='/apply_for_job' element={<Apply_for_job/>}/>
          <Route path='/view_worker_application' element={<View_worker_application/>}/>
          <Route path='/book_slot' element={<Book_slot/>}/>
          <Route path='/recruited' element={<Recruited/>}/>
          <Route path='/accepted_applications' element={<Accepted_applications/>}/>
          <Route path='/rejected_applications' element={<Rejected_applications/>}/> 
          <Route path='/write_review' element={<Write_review/>}/>
          <Route path='/pending_requests' element={<Pending_requests/>}/>
          <Route path='/pending_worker_jobs' element={<Pending_worker_jobs/>}/>
          <Route path='/rejected_worker_jobs' element={<Rejected_worker_jobs/>}/>
          <Route path='/job_offers' element={<Job_offers/>}/>
          <Route path='/Accept_job_offers' element={<Accept_job_offers/>}/>
          <Route path='/rejected_job_offers' element={<Rejected_job_offers/>}/>
          <Route path='/workers_info' element={<Workers_info/>}/>
          <Route path='/user_profile' element={<User_profile/>}/>
          <Route path='/clients_info' element={<Clients_info/>}/>
          <Route path='/booking_form' element={<Booking_form/>}/>
          <Route path='/completed_jobs' element={<Completed_jobs/>}/>
          <Route path='/admin_management' element={<Admin_management/>}/>
          <Route path='/allot_worker' element={<Allot_worker/>}/>
          <Route path='/admin_complaints' element={<Admin_complaints/>}/>
          <Route path='/notifications' element={<Notifications/>}/>
        </Routes>
        </main>
    </div>
  )
}

export default App;
