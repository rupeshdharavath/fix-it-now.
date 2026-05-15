import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast ,ToastContainer} from "react-toastify";
import { api } from "../lib/api";

function Profile() {
  const navigate = useNavigate();
  const token=localStorage.getItem('token');
  const login_email = localStorage.getItem("user_email");
  const login_role = localStorage.getItem("role");
  const login_name = localStorage.getItem("user_name");
  const [all_reviews,set_all_reviews]=useState([]);
  const [AvgSum,setAvgSum]=useState(0);
  const [totalReviews,setTotalReviews]=useState(0);

  const get_reviews_overview=async(e)=>{
  try {
    const res = await api.get('/api/reviews/get_review_overview', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const reviews = res.data.all_reviews || []; 
    set_all_reviews(reviews);
    const sum = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    const avg = reviews.length > 0 ? sum / reviews.length : 0;
    setTotalReviews(reviews.length);
    setAvgSum(avg.toFixed(1)); 
  } catch (err) {
  }
}

  const delete_review=async(bookingId)=>{
    try{
      const res= await api.put(`/api/reviews/deleteReview/${bookingId}`,{}, {
        headers:{Authorization:`Bearer ${token}`}
      });
      toast.success(res.data.message);
      get_reviews_overview();
    }catch(err){
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNum: "",
    Street: "",
    mandal: "",
    district: "",
    state: "",
    country: "",
    pinCode: "",
    profilePic: "", 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          fullName: res.data.fullName || "",
          mobileNum: res.data.mobileNum || "",
          Street: res.data.Street || "",
          mandal: res.data.mandal || "",
          district: res.data.district || "",
          state: res.data.state || "",
          country: res.data.country || "",
          pinCode: res.data.pinCode || "",
          profilePic: res.data.profilePic || "", 
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    if(login_role==='worker' || login_role==='client'){
      get_reviews_overview();
    }
    fetchProfile();
  }, []);

  const logout_user = async () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <>
      <div className="page-container enter-up py-4">
        <div className="page-hero mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="section-kicker">Profile dashboard</span>
            <h1 className="section-title mt-3">Welcome back, {login_name || "user"}</h1>
            <p className="mt-2 text-slate-300">Manage your profile, reviews, and activity from one calm dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/update_profile" className="neo-button-secondary">
              Edit profile
            </Link>
            <button className="neo-button-danger" onClick={logout_user}>
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="glass-card-soft h-fit p-6 lg:sticky lg:top-28">
            <div className="flex flex-col items-center text-center">
              <img
                src={formData.profilePic || "vite.svg"}
                alt="Profile"
                className="mb-4 h-32 w-32 rounded-full border border-white/10 object-cover shadow-xl"
              />
              <h2 className="text-2xl font-bold text-white">{login_name}</h2>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">{login_role}</p>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-200">
              <div className="stat-badge"><span className="text-slate-400">Email:</span> {login_email}</div>
              <div className="stat-badge"><span className="text-slate-400">Mobile:</span> {formData.mobileNum || "Add number"}</div>
              <div className="stat-badge"><span className="text-slate-400">Address:</span> {`${formData.Street}, ${formData.mandal}, ${formData.district}`}</div>
              <div className="stat-badge"><span className="text-slate-400">Location:</span> {`${formData.state}, ${formData.country} - ${formData.pinCode}`}</div>
            </div>
          </aside>

          <section className="space-y-6">
            {login_role === "worker" && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="section-kicker">Feedback</span>
                    <h3 className="section-title mt-2 text-2xl">Client reviews</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="stat-badge text-center"><div className="text-xs text-slate-400">Avg rating</div><div className="text-xl font-bold text-cyan-200">{AvgSum}</div></div>
                    <div className="stat-badge text-center"><div className="text-xs text-slate-400">Reviews</div><div className="text-xl font-bold text-white">{all_reviews.length}</div></div>
                  </div>
                </div>
                <div className="grid gap-4">
                  {all_reviews.length > 0 ? all_reviews.map((review) => (
                    <article key={review._id} className="glass-card-soft p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Client</p>
                          <h4 className="text-lg font-semibold text-white">{review.clientId?.fullName || "Anonymous"}</h4>
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Job</p>
                          <h4 className="text-lg font-semibold text-white">{review.jobId?.job || "N/A"}</h4>
                        </div>
                      </div>
                      <div className="mt-3 text-lg text-amber-300">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>{star <= review.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <p className="mt-3 text-slate-200">{review.review}</p>
                    </article>
                  )) : <p className="text-slate-300">No reviews yet.</p>}
                </div>
              </>
            )}

            {login_role === "client" && (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="section-kicker">Trust</span>
                    <h3 className="section-title mt-2 text-2xl">Your reviews</h3>
                  </div>
                  <div className="stat-badge text-center"><div className="text-xs text-slate-400">Total reviews</div><div className="text-xl font-bold text-cyan-200">{totalReviews}</div></div>
                </div>
                <div className="grid gap-4">
                  {all_reviews.length > 0 ? all_reviews.map((review) => (
                    <article key={review._id} className="glass-card-soft p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Worker</p>
                          <h4 className="text-lg font-semibold text-white">{review.workerId?.fullName || "Anonymous"}</h4>
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Job</p>
                          <h4 className="text-lg font-semibold text-white">{review.jobId?.job || "N/A"}</h4>
                        </div>
                      </div>
                      <div className="mt-3 text-lg text-amber-300">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>{star <= review.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-slate-200">{review.review}</p>
                        <button className="neo-button-danger sm:w-auto" onClick={()=>delete_review(review._id)}>Delete</button>
                      </div>
                    </article>
                  )) : <p className="text-slate-300">No reviews yet.</p>}
                </div>
              </>
            )}

            {login_role !== "worker" && login_role !== "client" && (
              <div className="glass-card-soft p-6">
                <h3 className="text-2xl font-bold text-white">Admin section</h3>
                <p className="mt-2 text-slate-300">Use the admin menu to review applications and manage users.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    <ToastContainer position="top-right" autoClose={1000}/>
    </>
  );
}

export default Profile;
