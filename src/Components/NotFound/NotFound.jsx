import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* 404 Animation */}
        <div className="not-found-animation">
          <div className="error-code">404</div>
          <div className="error-icon">
            <Search size={80} />
          </div>
        </div>

        {/* Error Message */}
        <div className="not-found-message">
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <button 
            className="action-btn primary-btn" 
            onClick={handleGoHome}
          >
            <Home size={20} />
            Go to Home
          </button>
          
          <button 
            className="action-btn secondary-btn" 
            onClick={handleGoBack}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="not-found-links">
          <p className="links-title">You might be looking for:</p>
          <div className="helpful-links">
            <button 
              className="link-btn" 
              onClick={() => navigate("/home")}
            >
              🏠 Home
            </button>
            <button 
              className="link-btn" 
              onClick={() => navigate("/profile")}
            >
              👤 Profile
            </button>
            <button 
              className="link-btn" 
              onClick={() => navigate("/trainer")}
            >
              💪 Trainer
            </button>
            <button 
              className="link-btn" 
              onClick={() => navigate("/neutritionist")}
            >
              🥗 Dietician
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
