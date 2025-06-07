import { useState, useEffect } from 'react';
import axios from "axios";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../../api.js";

function ProfileCard () {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [roleInTeam, setRoleInTeam] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const userData = res.data;
        setProfile(userData);
        setName(userData.name || "");
        setPhone(userData.phone || "");
        setEmail(userData.email || "");
        setTeam(userData.team || "");
        setRoleInTeam(userData.roleInTeam || "");
      } catch (err) {
        console.error("Fetch profile error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []); // Empty dependency array

  // Animation variants for card hover
  const cardVariants = {
    initial: { scale: 1,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 15px rgba(210, 0, 0, 0.3)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  // Animation variants for elements
  const elementVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.2, 
          ease: "easeOut" 
      },
    },
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-6 p-4 flex items-center justify-center -mt-24">
      <motion.div
        className="initial w-full max-w-md bg-white bg-opacity-95 rounded-3xl border border-red-200 sm:p-8"
        initial="hover"
        variants={cardVariants}
        whileHover="hover"
      >
        <motion.h2 
          className="text-xl font-semibold text-center mb-3 text-[#ff0000] sm:text-2xl sm:mb-6"
          variant="h2"
          variants={elementVariants}
        >
          My Profile
        </motion.h2>
        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-200 text-sm sm:text-red-900 text-red-800 rounded-xl text-center border-red-100"
            variants={elementVariants}
          >
            {error}
          </motion.div>
        )}
        {profile ? (
          <motion.div 
            className="space-y-5"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={elementVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="p-2 bg-gray-100 rounded-xl text-gray-800">{name || "N/A"}</div>
            </motion.div>
            <motion.div variants={elementVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="p-2 bg-gray-100 rounded-xl text-gray-800">{email || "Not provided"}</div>
            </motion.div>
            <motion.div variants={elementVariants}>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="p-2 bg-gray-100 rounded-xl text-gray-800">{phone || "N/A"}</div>
            </motion.div>
            <motion.div variants={elementVariants}>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <div className="p-2 bg-gray-100 rounded-xl text-gray-800">{team || "N/A"}</div>
            </motion.div>
            <motion.div variants={elementVariants}>
              <label htmlFor="roleInTeam" className="block text-sm font-medium text-gray-700 mb-1">
                Role in Team
              </label>
              <div className="p-2 bg-gray-100 rounded-xl text-gray-800">{roleInTeam || "N/A"}</div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.p 
            className="text-gray-600 text-center text-sm sm:text-base"
            variants={elementVariants}
          >
            Loading profile...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default ProfileCard;