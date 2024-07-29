import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { Nav, Button, Container, Row, Col, Card } from "react-bootstrap";
import { GoogleButton } from "react-google-button";
import { auth, provider, db } from "../../config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import { FaGoogle } from "react-icons/fa"; // Import Google icon from react-icons/fa

function LandingPage() {
  return (
    <div>
      <Navbar />

      <section className="landing-hero text-white text-center d-flex align-items-center justify-content-center">
        <Container>
          <h1>Work Hard to Get a Better Life</h1>
          <p>Get your personalized training right now</p>
        </Container>
      </section>

      {/* Features Section */}
      {/* <section className="landing-features py-5">
        <Container>
          <Row>
            <Col md={3} className="text-center">
              <div className="landing-feature-box">
                <h3>Our Classes</h3>
                <p>Learn more</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="landing-feature-box">
                <h3>Our Trainers</h3>
                <p>Learn more</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="landing-feature-box">
                <h3>Memberships</h3>
                <p>Learn more</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="landing-feature-box">
                <h3>Our Timeline</h3>
                <p>Learn more</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section> */}

      {/* Trainers Section */}
      {/* <section className="landing-trainers py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 text-dark">Our Trainers</h2>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Img variant="top" src="https://via.placeholder.com/150" />
                <Card.Body>
                  <Card.Title>James</Card.Title>
                  <Card.Text>Dumbbell Trainer</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Img variant="top" src="https://via.placeholder.com/150" />
                <Card.Body>
                  <Card.Title>Desert</Card.Title>
                  <Card.Text>Fitness Trainer</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Img variant="top" src="https://via.placeholder.com/150" />
                <Card.Body>
                  <Card.Title>Oliver</Card.Title>
                  <Card.Text>Crossfit Coach</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section> */}

      {/* Membership Section */}
      {/* <section className="landing-membership py-5">
        <Container>
          <h2 className="text-center mb-5">Our Membership</h2>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Basic</Card.Title>
                  <Card.Text>$49/month</Card.Text>
                  <ul>
                    <li>Personal Training</li>
                    <li>Body Building</li>
                    <li>Running Classes</li>
                  </ul>
                  <Button variant="primary">Join Now</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Standard</Card.Title>
                  <Card.Text>$69/month</Card.Text>
                  <ul>
                    <li>Personal Training</li>
                    <li>Body Building</li>
                    <li>Running Classes</li>
                  </ul>
                  <Button variant="primary">Join Now</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Premium</Card.Title>
                  <Card.Text>$99/month</Card.Text>
                  <ul>
                    <li>Personal Training</li>
                    <li>Body Building</li>
                    <li>Running Classes</li>
                  </ul>
                  <Button variant="primary">Join Now</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section> */}

      {/* Testimonials Section */}
      {/* <section className="landing-testimonials py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Testimonials</h2>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Text>"The best gym ever!"</Card.Text>
                  <Card.Title>Lindsey</Card.Title>
                  <Card.Subtitle>Client</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Text>
                    "Amazing trainers and great atmosphere."
                  </Card.Text>
                  <Card.Title>Jonathan</Card.Title>
                  <Card.Subtitle>Client</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Text>"Highly recommend this gym!"</Card.Text>
                  <Card.Title>Emma</Card.Title>
                  <Card.Subtitle>Client</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section> */}

      {/* Footer */}
      {/* <footer className="landing-footer bg-dark text-white text-center py-4">
        <Container>
          <Row>
            <Col md={4}>
              <h5>About Us</h5>
              <p>Learn more about PowerZone</p>
            </Col>
            <Col md={4}>
              <h5>Contact Us</h5>
              <p>Get in touch with us</p>
            </Col>
            <Col md={4}>
              <h5>Follow Us</h5>
              <p>On social media</p>
            </Col>
          </Row>
        </Container>
      </footer> */}

      {/* ToastContainer */}
      <ToastContainer />
    </div>
  );
}

export default LandingPage;
