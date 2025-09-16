import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import {
  FaDumbbell,
  FaHeartbeat,
  FaRunning,
  FaArrowRight,
  FaCheck,
  FaChartLine,
  FaUserFriends,
  FaAward,
} from "react-icons/fa";
import "animate.css";

function LandingPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Futuristic color palette
  const colors = {
    primary: "#6366F1", // Electric indigo
    secondary: "#10B981", // Emerald green
    accent: "#F59E0B", // Amber
    dark: "#0F172A", // Deep navy
    lightDark: "#1E293B", // Lighter navy
    light: "#F1F5F9", // Light background
    textPrimary: "#E2E8F0", // Light text
    textSecondary: "#94A3B8", // Muted text
  };

  const heroSectionStyle = {
    background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.lightDark} 100%)`,
    minHeight: "100vh",
    color: colors.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "2rem 0",
    position: "relative",
    overflow: "hidden",
  };

  // Add futuristic background elements
  const backgroundElements = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 40%)
    `,
    zIndex: 0,
  };

  const featureCardStyle = {
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    border: "none",
    borderRadius: "16px",
    background: `linear-gradient(145deg, ${colors.lightDark} 0%, #1a243d 100%)`,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    overflow: "hidden",
    height: "100%",
    border: `1px solid rgba(255, 255, 255, 0.05)`,
  };

  const featureCardHoverStyle = {
    transform: "translateY(-12px)",
    boxShadow: `0 15px 35px rgba(99, 102, 241, 0.2)`,
    border: `1px solid rgba(99, 102, 241, 0.3)`,
  };

  const ctaSectionStyle = {
    background: `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)`,
    color: "#fff",
    padding: "6rem 0",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  };

  const buttonStyle = {
    padding: "1rem 2.5rem",
    fontWeight: "600",
    borderRadius: "50px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    border: "none",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontSize: "0.9rem",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: `linear-gradient(135deg, ${colors.accent} 0%, #fbbf24 100%)`,
    color: colors.dark,
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "white",
    border: `2px solid ${colors.accent}`,
  };

  const sectionPadding = {
    padding: "6rem 0",
  };

  const statSectionStyle = {
    backgroundColor: colors.dark,
    padding: "5rem 0",
    position: "relative",
  };

  const testimonialSectionStyle = {
    backgroundColor: colors.lightDark,
    padding: "5rem 0",
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
        backgroundColor: colors.dark,
        color: colors.textPrimary,
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={backgroundElements}></div>
        <Container style={{ position: "relative", zIndex: 1 }}>
          <Row className="justify-content-center">
            <Col lg={10}>
              <h6
                className="text-uppercase mb-3 animate__animated animate__fadeIn"
                style={{
                  color: colors.accent,
                  letterSpacing: "3px",
                  fontSize: "0.9rem",
                }}
              >
                Premium Fitness Experience
              </h6>
              <h1
                className="display-3 fw-bold mb-4 animate__animated animate__fadeInDown"
                style={{ lineHeight: "1.2" }}
              >
                Transform Your Body, <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Transform Your Life
                </span>
              </h1>
              <p
                className="lead mb-5 animate__animated animate__fadeInUp"
                style={{
                  fontSize: "1.3rem",
                  maxWidth: "700px",
                  margin: "0 auto",
                  color: colors.textSecondary,
                }}
              >
                Expert coaching, measurable results, and a supportive community
                designed to help you achieve your fitness goals.
              </p>
              {/* <div className="d-flex gap-3 justify-content-center flex-wrap animate__animated animate__fadeInUp animate__delay-1s">
                <Button style={primaryButtonStyle} className="btn-hover">
                  Start Free Trial <FaArrowRight className="ms-2" />
                </Button>
                <Button style={secondaryButtonStyle} className="btn-hover">
                  View Programs
                </Button>
              </div> */}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section style={statSectionStyle}>
        <div style={backgroundElements}></div>
        <Container style={{ position: "relative", zIndex: 1 }}>
          <Row className="text-center">
            <Col md={3} className="mb-5 mb-md-0">
              <FaUserFriends
                size={40}
                style={{ color: colors.primary, marginBottom: "1rem" }}
              />
              <h2
                className="fw-bold display-4"
                style={{ color: colors.textPrimary }}
              >
                15K+
              </h2>
              <p style={{ color: colors.textSecondary }}>Active Members</p>
            </Col>
            <Col md={3} className="mb-5 mb-md-0">
              <FaAward
                size={40}
                style={{ color: colors.accent, marginBottom: "1rem" }}
              />
              <h2
                className="fw-bold display-4"
                style={{ color: colors.textPrimary }}
              >
                98%
              </h2>
              <p style={{ color: colors.textSecondary }}>Satisfaction Rate</p>
            </Col>
            <Col md={3} className="mb-5 mb-md-0">
              <FaDumbbell
                size={40}
                style={{ color: colors.secondary, marginBottom: "1rem" }}
              />
              <h2
                className="fw-bold display-4"
                style={{ color: colors.textPrimary }}
              >
                250+
              </h2>
              <p style={{ color: colors.textSecondary }}>Expert Coaches</p>
            </Col>
            <Col md={3}>
              <FaChartLine
                size={40}
                style={{ color: colors.primary, marginBottom: "1rem" }}
              />
              <h2
                className="fw-bold display-4"
                style={{ color: colors.textPrimary }}
              >
                10+
              </h2>
              <p style={{ color: colors.textSecondary }}>Years Experience</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section style={sectionPadding}>
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h6
                className="text-uppercase mb-3"
                style={{ color: colors.accent, letterSpacing: "2px" }}
              >
                Why Choose Us
              </h6>
              <h2
                className="fw-bold mb-4"
                style={{ color: colors.textPrimary }}
              >
                Professional Approach to Your Fitness Journey
              </h2>
              <p style={{ color: colors.textSecondary }}>
                Our scientifically-backed methods and personalized approach
                ensure you get the results you deserve.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={3}>
              <Card
                style={{
                  ...featureCardStyle,
                  ...(hoveredCard === 2 ? featureCardHoverStyle : {}),
                }}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-4">
                  <div
                    className="mb-4"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      background: `linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      transform: "rotate(45deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <FaHeartbeat
                      size={30}
                      style={{
                        color: colors.accent,
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </div>
                  <Card.Title
                    className="fw-bold mb-3 fs-5"
                    style={{ color: colors.textPrimary }}
                  >
                    1000+ workout catelog
                  </Card.Title>
                  <Card.Text style={{ color: colors.textSecondary }}>
                    Choose workout from 1000+ exercises with detailed
                    instructions and demonstrations.
                  </Card.Text>
                  <div className="text-start mt-4">
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Calisthenics workouts
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Filter by equipment and body parts
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Multi-level filtering options
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                style={{
                  ...featureCardStyle,
                  ...(hoveredCard === 1 ? featureCardHoverStyle : {}),
                }}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-4">
                  <div
                    className="mb-4"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      background: `linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      transform: "rotate(45deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <FaDumbbell
                      size={30}
                      style={{
                        color: colors.primary,
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </div>
                  <Card.Title
                    className="fw-bold mb-3 fs-5"
                    style={{ color: colors.textPrimary }}
                  >
                    Personalized Workouts
                  </Card.Title>
                  <Card.Text style={{ color: colors.textSecondary }}>
                    Custom training plans tailored to your body type, goals, and
                    lifestyle with regular adjustments based on progress.
                  </Card.Text>
                  <div className="text-start mt-4">
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Goal-specific programming
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Form correction guidance
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Progressive overload tracking
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                style={{
                  ...featureCardStyle,
                  ...(hoveredCard === 2 ? featureCardHoverStyle : {}),
                }}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-4">
                  <div
                    className="mb-4"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      background: `linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, transparent 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      transform: "rotate(45deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <FaHeartbeat
                      size={30}
                      style={{
                        color: colors.accent,
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </div>
                  <Card.Title
                    className="fw-bold mb-3 fs-5"
                    style={{ color: colors.textPrimary }}
                  >
                    Health & Nutrition
                  </Card.Title>
                  <Card.Text style={{ color: colors.textSecondary }}>
                    Comprehensive nutrition planning with evidence-based
                    recommendations and personalized macro tracking.
                  </Card.Text>
                  <div className="text-start mt-4">
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Custom meal plans
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Supplement guidance
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Habit formation system
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col md={3}>
              <Card
                style={{
                  ...featureCardStyle,
                  ...(hoveredCard === 3 ? featureCardHoverStyle : {}),
                }}
                onMouseEnter={() => setHoveredCard(3)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-4">
                  <div
                    className="mb-4"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      background: `linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      transform: "rotate(45deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <FaRunning
                      size={30}
                      style={{
                        color: colors.secondary,
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </div>
                  <Card.Title
                    className="fw-bold mb-3 fs-5"
                    style={{ color: colors.textPrimary }}
                  >
                    Progress Analytics
                  </Card.Title>
                  <Card.Text style={{ color: colors.textSecondary }}>
                    Advanced tracking with visual analytics to monitor
                    performance, body composition, and milestone achievements.
                  </Card.Text>
                  <div className="text-start mt-4">
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Body measurement tracking
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Performance analytics
                    </p>
                    <p
                      className="small"
                      style={{ color: colors.textSecondary }}
                    >
                      <FaCheck
                        className="me-2"
                        style={{ color: colors.secondary }}
                      />
                      Custom report generation
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonial Section */}
      <section style={testimonialSectionStyle}>
        <Container>
          <Row className="justify-content-center mb-5">
            <Col lg={8} className="text-center">
              <h6
                className="text-uppercase mb-3"
                style={{ color: colors.accent, letterSpacing: "2px" }}
              >
                Success Stories
              </h6>
              <h2
                className="fw-bold mb-4"
                style={{ color: colors.textPrimary }}
              >
                Hear From Our Members
              </h2>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-4">
              <Card
                style={{
                  border: "none",
                  background: `linear-gradient(145deg, ${colors.lightDark} 0%, #1a243d 100%)`,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                  borderRadius: "16px",
                  border: `1px solid rgba(255, 255, 255, 0.05)`,
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <img
                      src="https://randomuser.me/api/portraits/women/45.jpg"
                      alt="User"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="ms-3">
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.textPrimary }}
                      >
                        Sarah Johnson
                      </h6>
                      <small style={{ color: colors.textSecondary }}>
                        Lost 32lbs in 4 months
                      </small>
                    </div>
                  </div>
                  <p
                    style={{ color: colors.textSecondary, fontStyle: "italic" }}
                    className="mb-0"
                  >
                    "The personalized approach completely changed my
                    relationship with fitness. I've not only reached my goal
                    weight but have maintained it for over a year now."
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card
                style={{
                  border: "none",
                  background: `linear-gradient(145deg, ${colors.lightDark} 0%, #1a243d 100%)`,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                  borderRadius: "16px",
                  border: `1px solid rgba(255, 255, 255, 0.05)`,
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="User"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="ms-3">
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.textPrimary }}
                      >
                        Michael Thompson
                      </h6>
                      <small style={{ color: colors.textSecondary }}>
                        Gained 15lbs of muscle
                      </small>
                    </div>
                  </div>
                  <p
                    style={{ color: colors.textSecondary, fontStyle: "italic" }}
                    className="mb-0"
                  >
                    "As someone who struggled to gain weight my whole life, the
                    tailored nutrition plan and workout regimen helped me build
                    muscle I never thought possible."
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section
        style={{
          background: `linear-gradient(135deg, #1A1F31 0%, #2C2C4A 100%)`,
          color: "#fff",
          padding: "6rem 0",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2
                className="fw-bold mb-3"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                Ready to Transform Your Life?
              </h2>
              <p
                className="lead mb-4 opacity-75"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  color: "#B0B0C4",
                }}
              >
                Join our community of thousands who are achieving their fitness
                goals with our expert-backed programs.
              </p>
              <Button
                style={{
                  padding: "1rem 2.5rem",
                  fontWeight: "600",
                  borderRadius: "50px",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  border: "none",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontSize: "0.9rem",
                  background: `linear-gradient(135deg, #FF6B6B 0%, #E63946 100%)`, // A bold, fiery gradient
                  color: "#fff",
                }}
                size="lg"
                className="mt-3"
              >
                Start Your Journey Today
              </Button>
              <p className="mt-4 small opacity-75" style={{ color: "#B0B0C4" }}>
                No credit card required • Free 14-day trial • Cancel anytime
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <ToastContainer />
    </div>
  );
}

export default LandingPage;
