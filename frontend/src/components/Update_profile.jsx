import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function Update_Profile() {
  const navigate = useNavigate();
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
  });
  const [loading, setLoading] = useState(true);
  const [profilePicFile, setProfilePicFile] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          mobileNum: data.mobileNum || "",
          Street: data.Street || "",
          mandal: data.mandal || "",
          district: data.district || "",
          state: data.state || "",
          country: data.country || "",
          pinCode: data.pinCode || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update personal details
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put("/api/user/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  // Update profile picture
  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    if (!profilePicFile) {
      alert("Please select an image first");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formDataPic = new FormData();
      formDataPic.append("profilePic", profilePicFile);

      await api.put("/api/user/update", formDataPic, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="page-container py-4">
      <div className="page-hero mx-auto max-w-4xl p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <span className="section-kicker">Profile settings</span>
          <h1 className="section-title">Update profile</h1>
          <p className="text-slate-300">Keep your name, address, and photo up to date so bookings stay accurate.</p>
        </div>

        <div className="glass-card-soft mb-6 p-5">
          <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">Change profile picture</label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="file"
              className="neo-input md:max-w-md"
              accept="image/*"
              onChange={(e) => setProfilePicFile(e.target.files[0])}
            />
            <button
              className="neo-button-secondary"
              onClick={handleProfilePicUpload}
            >
              Upload picture
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="neo-input" />
          <input type="text" name="mobileNum" value={formData.mobileNum} onChange={handleChange} placeholder="Mobile Number" className="neo-input" />
          <input type="text" name="Street" value={formData.Street} onChange={handleChange} placeholder="Street" className="neo-input sm:col-span-2" />
          <input type="text" name="mandal" value={formData.mandal} onChange={handleChange} placeholder="Mandal" className="neo-input" />
          <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" className="neo-input" />
          <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="neo-input" />
          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="neo-input" />
          <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="Pin Code" className="neo-input sm:col-span-2" />

          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="neo-button-secondary" onClick={() => navigate("/profile")}>Cancel</button>
            <button type="submit" className="neo-button">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Update_Profile;
