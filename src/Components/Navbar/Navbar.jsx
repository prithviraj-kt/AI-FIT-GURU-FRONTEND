import React, { useEffect, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  useEffect(() => {
    getMailId();
  }, []);

  const [mail, setMail] = useState("");
  const getMailId = async () => {
    const emailId = await localStorage.getItem("email");
    setMail(emailId);
  };

  const logout = async () => {
    await localStorage.clear();
    navigate("/login");
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand text-light" to="/home">
            Lets Workout
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className="nav-link text-light"
                  aria-current="page"
                  to="/home"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link text-light"
                  aria-current="page"
                  to={`/profile`}
                >
                  Profile
                </NavLink>
              </li>
              <li className="nav-item">
                <button
                  onClick={logout}
                  className="nav-link active btn btn-link text-light"
                  aria-current="page"
                >
                  Logout
                </button>
              </li>
            </ul>
            {/* Uncomment if search functionality is needed
            <form className="d-flex">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button className="btn btn-outline-light" type="submit">
                Search
              </button>
            </form>
            */}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
