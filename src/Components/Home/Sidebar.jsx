import React from 'react';
import './Sidebar.css';

function Sidebar({ handleQuickAccess, selectedType }) {
  return (
    <div className="home-sidebar">
      {["all", "equipment", "bodyPart", "calisthenics", "yoga"].map((item, index) => (
        <button
          key={index}
          onClick={() => handleQuickAccess(item)}
          className={`home-sidebar-btn ${selectedType === item ? "home-btn-selected" : ""}`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default Sidebar;
