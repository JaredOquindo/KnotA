import { useState, useEffect, useRef } from "react";
import { FaRegCalendarAlt, FaUserCircle } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    const optionsDate = { month: "long", day: "numeric", year: "numeric" };
    const optionsTime = { hour: "numeric", minute: "numeric", hour12: true };
    const formattedDate = now.toLocaleDateString("en-US", optionsDate);
    const formattedTime = now.toLocaleTimeString("en-US", optionsTime);
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
    return { dayOfWeek, formattedDate, formattedTime };
  };

  const { dayOfWeek, formattedDate, formattedTime } = getCurrentDateTime();

  const getFirstName = (fullName) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
  };

  return (
    <div className="topbar-container">
      {/* Date */}
      <div className="flex items-center space-x-2">
        <FaRegCalendarAlt className="text-gray-500" />
        <span className="text-gray-500">{dayOfWeek}</span>
        <span className="font-semibold">{formattedDate}</span>
      </div>

      {/* Time */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">Time</span>
        <span className="font-semibold">{formattedTime}</span>
      </div>

      {/* Profile */}
      <div className="relative flex items-center space-x-2" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 focus:outline-none profile-box"
        >
          <div className="profile-image-circle">
            <FaUserCircle className="text-2xl text-gray-600" />
          </div>
          {user && (
            <span className="font-semibold">{getFirstName(user.fullName)}</span>
          )}
          <IoMdMenu className="text-gray-600 text-2xl" />
        </button>

        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => {
                setIsDropdownOpen(false);
                navigate("/app/profile");
              }}
            >
              Profile
            </button>
            <button
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              Settings
            </button>
            <button
              className="dropdown-item text-red-500"
              onClick={() => {
                setIsDropdownOpen(false);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
