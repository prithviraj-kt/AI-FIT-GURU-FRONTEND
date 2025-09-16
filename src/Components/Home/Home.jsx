import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "../../config";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import {
  Dumbbell,
  StretchHorizontal,
  Grid,
  Flower2,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Target,
  Activity
} from "lucide-react";

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const options = [
    { key: "all", label: "All", icon: <Grid size={18} /> },
    { key: "equipment", label: "Equipment", icon: <Dumbbell size={18} /> },
    { key: "bodyPart", label: "Body Part", icon: <Activity size={18} /> },
    { key: "calisthenics", label: "Calisthenics", icon: <StretchHorizontal size={18} /> },
    // { key: "yoga", label: "Yoga", icon: <Flower2 size={18} /> },
  ];

  const navigate = useNavigate();
  const [workouts, setWorkout] = useState([]);
  const [quickAccess, setQuickAccess] = useState("all");
  const [equipments, setEquipments] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);
  const [targets, setTargets] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  // New: multi-select filters
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [selectedBodyPartsMulti, setSelectedBodyPartsMulti] = useState([]);
  const [selectedTargetsMulti, setSelectedTargetsMulti] = useState([]);
  const [yogaCategories, setYogaCategories] = useState([]);
  const [yogaData, setYogaData] = useState([]);
  const [selectedYogaCategory, setSelectedYogaCategory] = useState(null);
  const [activeFilterLevel, setActiveFilterLevel] = useState(0); // 0: none, 1: category, 2: target

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Futuristic color palette
  const colors = {
    primary: "#6366F1",      // Electric indigo
    secondary: "#10B981",    // Emerald green
    accent: "#F59E0B",       // Amber
    dark: "#0F172A",         // Deep navy
    lightDark: "#1E293B",    // Lighter navy
    light: "#F1F5F9",        // Light background
    textPrimary: "#E2E8F0",  // Light text
    textSecondary: "#94A3B8" // Muted text
  };

  useEffect(() => {
    auth();
    getWorkout();
    fetchYogaData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const auth = () => {
    const auth = localStorage.getItem("email");
    if (!auth) navigate("/");
  };

  const getWorkout = async () => {
    try {
      const getWorkouts = await localStorage.getItem("workout");
      const getYoga = await localStorage.getItem("yoga");

      if (!getYoga) {
        try {
          const response = await axios.get("https://yoga-api-nzy4.onrender.com/v1/categories");
          await localStorage.setItem("yoga", JSON.stringify(response.data));
          setYogaCategories(response.data);
        } catch (error) {
          console.error("Error fetching yoga data:", error);
        }
      } else {
        setYogaCategories(JSON.parse(getYoga));
      }

      if (!getWorkouts || getWorkouts.length < 10) {
        const workoutsCollection = collection(db, "workouts");
        const querySnapshot = await getDocs(workoutsCollection);
        const workoutData = [];
        const equipmentSet = new Set();
        const bodyPartSet = new Set();

        querySnapshot.forEach((doc) => {
          const data = { ...doc.data(), id: doc.id };
          workoutData.push(data);
          if (data.equipment) equipmentSet.add(data.equipment);
          if (data.bodyPart) bodyPartSet.add(data.bodyPart);
        });

        setWorkout(workoutData);
        setFilteredWorkouts(workoutData);
        setEquipments([...equipmentSet]);
        setBodyParts([...bodyPartSet]);
        await localStorage.setItem("workout", JSON.stringify(workoutData));
      } else {
        const workoutData = JSON.parse(getWorkouts);
        setWorkout(workoutData);
        setFilteredWorkouts(workoutData);

        const equipmentSet = new Set();
        const bodyPartSet = new Set();
        workoutData.forEach((data) => {
          if (data.equipment) equipmentSet.add(data.equipment);
          if (data.bodyPart) bodyPartSet.add(data.bodyPart);
        });
        setEquipments([...equipmentSet]);
        setBodyParts([...bodyPartSet]);
      }
    } catch (error) {
      alert("Error occurred... Please try again later");
    }
  };

  const fetchYogaData = async () => {};

  const handleQuickAccess = (purpose) => {
    setSelectedItem(null);
    setTargets([]);
    setSelectedType(purpose);
    setSelectedTarget(null);
    setSelectedYogaCategory(null);
    setShowFilters(false);
    setActiveFilterLevel(1);
    // Reset multi-selects when choosing non granular quick filters
    if (purpose !== "equipment" && purpose !== "bodyPart") {
      setSelectedEquipments([]);
      setSelectedBodyPartsMulti([]);
      setSelectedTargetsMulti([]);
    }

    if (purpose === "yoga") {
      setQuickAccess("yoga");
      setActiveFilterLevel(0);
    } else if (purpose === "calisthenics") {
      setFilteredWorkouts(workouts.filter((w) => w.equipment === "body weight"));
      setQuickAccess("filtered");
      setActiveFilterLevel(0);
    } else if (purpose === "cardio") {
      setFilteredWorkouts(workouts.filter((w) => w.bodyPart === "cardio"));
      setQuickAccess("filtered");
      setActiveFilterLevel(0);
    } else if (purpose === "all") {
      setFilteredWorkouts(workouts);
      setQuickAccess("filtered");
      setActiveFilterLevel(0);
    } else {
      setQuickAccess(purpose);
      setActiveFilterLevel(1);
    }
    setCurrentPage(1);
  };

  const handleYogaCategoryClick = async (category) => {
    setSelectedYogaCategory(category);
    setYogaData(category.poses);
  };

  const computeFiltered = (base = workouts) => {
    let result = base;
    if (selectedEquipments.length > 0) {
      result = result.filter((w) => selectedEquipments.includes(w.equipment));
    }
    if (selectedBodyPartsMulti.length > 0) {
      result = result.filter((w) => selectedBodyPartsMulti.includes(w.bodyPart));
    }
    if (selectedTargetsMulti.length > 0) {
      result = result.filter((w) => selectedTargetsMulti.includes(w.target));
    }
    return result;
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedTarget(null);

    if (selectedType === "equipment") {
      const next = selectedEquipments.includes(item)
        ? selectedEquipments.filter((e) => e !== item)
        : [...selectedEquipments, item];
      setSelectedEquipments(next);
      const result = computeFiltered(workouts);
      setFilteredWorkouts(result);
      setActiveFilterLevel( (selectedBodyPartsMulti.length>0 || selectedTargetsMulti.length>0) ? 2 : 0);
    } else if (selectedType === "bodyPart") {
      const next = selectedBodyPartsMulti.includes(item)
        ? selectedBodyPartsMulti.filter((b) => b !== item)
        : [...selectedBodyPartsMulti, item];
      setSelectedBodyPartsMulti(next);
      // Recompute available targets from selected body parts
      const pool = workouts.filter((w) => (next.length ? next.includes(w.bodyPart) : true));
      const targetSet = new Set();
      pool.forEach((d) => d.target && targetSet.add(d.target));
      setTargets([...targetSet]);
      const result = computeFiltered(workouts);
      setFilteredWorkouts(result);
      setActiveFilterLevel(targetSet.size > 0 ? 2 : 0);
    }
    setCurrentPage(1);
  };

  const handleTargetClick = (target) => {
    const next = selectedTargetsMulti.includes(target)
      ? selectedTargetsMulti.filter((t) => t !== target)
      : [...selectedTargetsMulti, target];
    setSelectedTargetsMulti(next);
    setSelectedTarget(target);
    setQuickAccess("filtered");
    const result = computeFiltered(workouts);
    setFilteredWorkouts(result);
    setActiveFilterLevel(0);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedItem(null);
    setSelectedTarget(null);
    setSelectedType(null);
    setTargets([]);
    setFilteredWorkouts(workouts);
    setActiveFilterLevel(0);
    setCurrentPage(1);
    setSelectedEquipments([]);
    setSelectedBodyPartsMulti([]);
    setSelectedTargetsMulti([]);
  };

  const gotoSingleYoga = async (pose) => {
    navigate(`/yoga/${encodeURIComponent(pose.sanskrit_name)}`);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === "") {
      setFilteredWorkouts(workouts);
      return;
    }
    
    const filtered = workouts.filter(workout => 
      workout.name.toLowerCase().includes(query) ||
      (workout.bodyPart && workout.bodyPart.toLowerCase().includes(query)) ||
      (workout.target && workout.target.toLowerCase().includes(query)) ||
      (workout.equipment && workout.equipment.toLowerCase().includes(query))
    );
    
    setFilteredWorkouts(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems =
    quickAccess === "yoga" ? yogaData.slice(indexOfFirst, indexOfLast) : filteredWorkouts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(
    (quickAccess === "yoga" ? yogaData.length : filteredWorkouts.length) / itemsPerPage
  );

  // Sidebar styles
  const sidebarStyle = {
    background: `linear-gradient(180deg, ${colors.dark} 0%, #131c2f 100%)`,
    borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
    height: "calc(100vh - 76px)",
    position: "fixed",
    top: "76px",
    left: 0,
    zIndex: 100,
    transition: "all 0.3s ease",
    width: isOpen ? "250px" : "70px",
    overflowY: "auto",
    overflowX: "hidden"
  };

  const mainContentStyle = {
    marginLeft: isMobile ? "0" : (isOpen ? "250px" : "70px"),
    padding: "20px",
    transition: "all 0.3s ease",
    backgroundColor: colors.dark,
    minHeight: "calc(100vh - 76px)"
  };

  return (
    <div style={{ backgroundColor: colors.dark, minHeight: "100vh", color: colors.textPrimary }}>
      {/* Navbar */}
      <Navbar />
      
      <div>
        {/* Sidebar */}
        <aside style={sidebarStyle} className="d-none d-md-block">
          <div style={{ padding: "20px 15px" }}>
            <div style={{ display: "flex", justifyContent: isOpen ? "flex-end" : "center", marginBottom: "20px" }}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "8px",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.textPrimary,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              >
                {isOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleQuickAccess(opt.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 15px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedType === opt.key 
                      ? `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)` 
                      : "transparent",
                    color: selectedType === opt.key ? "#fff" : colors.textPrimary,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontWeight: selectedType === opt.key ? "600" : "400"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedType !== opt.key) {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedType !== opt.key) {
                      e.target.style.background = "transparent";
                    }
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>{opt.icon}</span>
                  {isOpen && <span style={{ fontSize: "0.9rem" }}>{opt.label}</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div style={mainContentStyle}>
          {/* Search and Filter Bar */}
          <div style={{ 
            display: "flex", 
            gap: "15px", 
            marginBottom: "20px",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <div style={{ 
              position: "relative", 
              flex: "1", 
              minWidth: "250px" 
            }}>
              <Search 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: "15px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: colors.textSecondary 
                }} 
              />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  width: "100%",
                  padding: "12px 15px 12px 45px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: colors.lightDark,
                  color: colors.textPrimary,
                  fontSize: "0.9rem",
                  transition: "all 0.2s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            
            {/* <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "12px",
                border: `1px solid ${showFilters ? colors.primary : "rgba(255, 255, 255, 0.1)"}`,
                background: showFilters ? `${colors.primary}20` : colors.lightDark,
                color: showFilters ? colors.primary : colors.textPrimary,
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease"
              }}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button> */}

            {(selectedItem || selectedTarget || selectedType) && (
              <button
                onClick={clearFilters}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: colors.lightDark,
                  color: colors.textPrimary,
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <X size={16} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
          
          {/* Multi-level Filter System */}
          {(activeFilterLevel > 0 || showFilters) && (
            <div style={{ 
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "12px",
              background: colors.lightDark,
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Filter size={18} />
                  <span style={{ fontWeight: "600" }}>Filter by:</span>
                  {activeFilterLevel > 0 && (
                    <span style={{ 
                      fontSize: "0.85rem", 
                      color: colors.textSecondary,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      {selectedType && (
                        <>
                          <span style={{ 
                            padding: "4px 8px", 
                            borderRadius: "6px", 
                            background: `${colors.primary}20`,
                            color: colors.primary,
                            fontSize: "0.75rem"
                          }}>
                            {selectedType}
                          </span>
                          {activeFilterLevel > 1 && <ChevronRight size={14} />}
                        </>
                      )}
                      {selectedItem && (
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "6px", 
                          background: `${colors.secondary}20`,
                          color: colors.secondary,
                          fontSize: "0.75rem"
                        }}>
                          {selectedItem}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setShowFilters(false);
                    if (!activeFilterLevel) clearFilters();
                  }}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: colors.textSecondary, 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "none";
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Equipment Filters */}
              {activeFilterLevel === 1 && selectedType === "equipment" && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {equipments.map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleItemClick(item)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        background: (selectedItem === item || selectedEquipments.includes(item)) 
                          ? `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)` 
                          : "rgba(255, 255, 255, 0.08)",
                        color: (selectedItem === item || selectedEquipments.includes(item)) ? "#fff" : colors.textPrimary,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: (selectedItem === item || selectedEquipments.includes(item)) ? "600" : "400",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedItem !== item) {
                          e.target.style.background = "rgba(255, 255, 255, 0.12)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedItem !== item) {
                          e.target.style.background = "rgba(255, 255, 255, 0.08)";
                        }
                      }}
                    >
                      <Dumbbell size={14} />
                      {item}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Body Part Filters */}
              {activeFilterLevel === 1 && selectedType === "bodyPart" && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {bodyParts.map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleItemClick(item)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "none",
                        background: (selectedItem === item || selectedBodyPartsMulti.includes(item)) 
                          ? `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)` 
                          : "rgba(255, 255, 255, 0.08)",
                        color: (selectedItem === item || selectedBodyPartsMulti.includes(item)) ? "#fff" : colors.textPrimary,
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: (selectedItem === item || selectedBodyPartsMulti.includes(item)) ? "600" : "400",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedItem !== item) {
                          e.target.style.background = "rgba(255, 255, 255, 0.12)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedItem !== item) {
                          e.target.style.background = "rgba(255, 255, 255, 0.08)";
                        }
                      }}
                    >
                      <Activity size={14} />
                      {item}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Target Filters (Second Level) */}
              {activeFilterLevel === 2 && targets.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.9rem", color: colors.textSecondary }}>
                    Select target muscle group:
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {targets.map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleTargetClick(item)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          border: "none",
                          background: (selectedTarget === item || selectedTargetsMulti.includes(item)) 
                            ? `linear-gradient(135deg, ${colors.secondary} 0%, #34d399 100%)` 
                            : "rgba(255, 255, 255, 0.08)",
                          color: (selectedTarget === item || selectedTargetsMulti.includes(item)) ? "#fff" : colors.textPrimary,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: (selectedTarget === item || selectedTargetsMulti.includes(item)) ? "600" : "400",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTarget !== item) {
                            e.target.style.background = "rgba(255, 255, 255, 0.12)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTarget !== item) {
                            e.target.style.background = "rgba(255, 255, 255, 0.08)";
                          }
                        }}
                      >
                        <Target size={14} />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Mobile Sidebar */}
          {isMobile && (
            <div style={{ 
              display: "flex", 
              gap: "10px", 
              overflowX: "auto", 
              padding: "10px 0", 
              marginBottom: "20px",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}>
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleQuickAccess(opt.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedType === opt.key 
                      ? `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)` 
                      : "rgba(255, 255, 255, 0.08)",
                    color: selectedType === opt.key ? "#fff" : colors.textPrimary,
                    cursor: "pointer",
                    flexShrink: 0,
                    fontWeight: selectedType === opt.key ? "600" : "400",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>{opt.icon}</span>
                  <span style={{ fontSize: "0.85rem" }}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.9rem", color: colors.textSecondary }}>
              Showing {currentItems.length} of{" "}
              {quickAccess === "yoga" ? yogaData.length : filteredWorkouts.length} results
            </span>
            {(selectedItem || selectedTarget) && (
              <span style={{ 
                padding: "4px 10px", 
                borderRadius: "12px", 
                background: `${colors.primary}20`,
                color: colors.primary,
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}>
                {selectedItem && `${selectedItem}`}
                {selectedTarget && ` → ${selectedTarget}`}
              </span>
            )}
          </div>

          {/* Workouts / Yoga Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <div 
                  key={index} 
                  style={{
                    background: colors.lightDark,
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                  }}
                  onClick={() =>
                    quickAccess === "yoga"
                      ? gotoSingleYoga(item)
                      : navigate(`/workout/${encodeURIComponent(item.name)}`)
                  }
                >
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img
                      src={quickAccess === "yoga" ? item.url_png : item.gifUrl}
                      alt={quickAccess === "yoga" ? item.sanskrit_name : item.name}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "transform 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: "500"
                    }}>
                      {quickAccess === "yoga" ? "Yoga" : (item.equipment || "Bodyweight")}
                    </div>
                  </div>
                  <div style={{ padding: "12px" }}>
                    <p style={{
                      margin: "0",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: colors.textPrimary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {quickAccess === "yoga" ? item.sanskrit_name : item.name}
                    </p>
                    {!quickAccess === "yoga" && item.bodyPart && (
                      <p style={{
                        margin: "5px 0 0 0",
                        fontSize: "0.75rem",
                        color: colors.textSecondary,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Activity size={12} />
                        {item.bodyPart}
                      </p>
                    )}
                    {!quickAccess === "yoga" && item.target && (
                      <p style={{
                        margin: "3px 0 0 0",
                        fontSize: "0.75rem",
                        color: colors.textSecondary,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Target size={12} />
                        {item.target}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                gridColumn: "1 / -1", 
                textAlign: "center", 
                padding: "40px 20px",
                color: colors.textSecondary
              }}>
                <p style={{ margin: 0, fontSize: "1.1rem", marginBottom: "10px" }}>No workouts found</p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              marginTop: "30px"
            }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: currentPage === 1 ? "rgba(255, 255, 255, 0.05)" : colors.primary,
                  color: currentPage === 1 ? colors.textSecondary : "#fff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.background = "#4f46e5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.background = colors.primary;
                  }
                }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              
              <span style={{
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                fontWeight: "500",
                minWidth: "80px",
                textAlign: "center"
              }}>
                {currentPage} / {totalPages}
              </span>
              
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: currentPage === totalPages ? "rgba(255, 255, 255, 0.05)" : colors.primary,
                  color: currentPage === totalPages ? colors.textSecondary : "#fff",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.background = "#4f46e5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.background = colors.primary;
                  }
                }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;