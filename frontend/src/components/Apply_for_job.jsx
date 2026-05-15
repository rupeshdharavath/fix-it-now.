import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../lib/api";

function Apply_for_job(){
    const navigate=useNavigate();
    const [formdata,setFormData]=useState({
        job:"",
        jobDescription:""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formdata, [e.target.name]: e.target.value });
    };

    const update_worker_info = async(e) => {
        e.preventDefault();
        if (!formdata.job.trim() || !formdata.jobDescription.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await api.post("/api/worker/create", formdata, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Job posted successfully! 🎉");
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to post job");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="page-container py-4">
            <div className="mx-auto max-w-2xl">
                <div className="page-hero mb-8">
                    <span className="section-kicker">Grow your business</span>
                    <h1 className="section-title">Post a new service</h1>
                    <p className="mt-2 text-slate-300">Tell potential clients about the services you offer and get hired faster.</p>
                </div>

                <div className="glass-card-soft p-8">
                    <form onSubmit={update_worker_info} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80 mb-2">
                                Service name
                            </label>
                            <input
                                type="text"
                                name="job"
                                value={formdata.job}
                                onChange={handleChange}
                                placeholder="e.g., Plumbing, Electrical Repair, Cleaning"
                                className="neo-input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80 mb-2">
                                Description
                            </label>
                            <textarea
                                name="jobDescription"
                                value={formdata.jobDescription}
                                onChange={handleChange}
                                placeholder="Describe the service in detail. What can clients expect? What experience do you have?"
                                className="neo-input w-full h-32 resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button 
                                type="button" 
                                className="neo-button-secondary flex-1"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="neo-button flex-1"
                                disabled={loading}
                            >
                                {loading ? "Posting..." : "Post Service"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={700} />
        </div>
    );
}

export default Apply_for_job;