import logo from "./logo.svg";
import "./App.css";
import { auth, provider } from "./config";
import { signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import Home from "./Home";

function App() {
  const [value, setValue] = useState("");
  const handleClick = () => {
    signInWithPopup(auth, provider).then(async (data) => {
      setValue(data.user.email);
      await localStorage.setItem("email", data.user);
    });
  };

  useEffect(() => {
    setValue(localStorage.getItem("email"));
  });

  return (
    <div className="App">
      {value ? (
        <Home />
      ) : (
        <button className="custom-google-button" onClick={handleClick}>
          {/* <img src="https://banner2.cleanpng.com/20180416/xlq/kisspng-g-suite-pearl-river-middle-school-google-software-sign-up-button-5ad4e1a9d11d62.1599053415239008418566.jpg" alt="Google logo" /> */}
          Signin with Google
        </button>
      )}
    </div>
  );
}

export default App;
