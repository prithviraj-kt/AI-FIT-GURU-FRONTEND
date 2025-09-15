import React, { useState } from "react";
import "./Sidebar.css";
import { Dumbbell, StretchHorizontal,  Grid, Flower2 } from "lucide-react"; // icons

function Sidebar({ handleQuickAccess, selectedType }) {
  const [isOpen, setIsOpen] = useState(true);

  const options = [
    { key: "all", label: "All", icon: <Grid size={18} /> },
    { key: "equipment", label: "Equipment", icon: <Dumbbell size={18} /> },
    { key: "bodyPart", label: "Body Part", icon: <Flower2 size={18} /> },
    { key: "calisthenics", label: "Calisthenics", icon: <StretchHorizontal size={18} /> },
    { key: "yoga", label: "Yoga", icon: <Flower2 size={18} /> },
  ];

  return (
    <aside className={`home-sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Toggle button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="sidebar-content">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleQuickAccess(opt.key)}
            className={`home-sidebar-btn ${
              selectedType === opt.key ? "home-btn-selected" : ""
            }`}
            aria-pressed={selectedType === opt.key}
          >
            <span className="sidebar-icon">{opt.icon}</span>
            <span
              className={`sidebar-label ${isOpen ? "show" : "hide"}`}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;