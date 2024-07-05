import axios from "axios";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Yoga() {
  const [yoga, setYoga] = useState([]);

  useEffect(() => {
    fetchYoga();
  }, []);

  const fetchYoga = async () => {
    try {
      const { data } = await axios.get(
        "https://yoga-api-nzy4.onrender.com/v1/categories"
      );
      console.log(data[0]);
      setYoga(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {yoga.map((item) => (
          <div className="col-lg-4 col-md-6 mb-4" key={item.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  {item.category_name}
                </h5>
                <p className="card-text">ID: {item.id}</p>
                <p>{item.category_description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Yoga;
