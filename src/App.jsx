import { Routes, Route, NavLink } from "react-router-dom";
import { Home } from "./pages/home";
import { Wallet } from "./pages/wallet";

export default function App() {
  return (
    <div className="App">
      <h1 className="logo">
        Dark Country Stats
        <span className="logo-custom">COMMUNITY MADE</span>
      </h1>

      <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-3">
        <div className="container-md">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-center"
            id="navbarNav"
          >
            <ul className="navbar-nav">
              {/* <li className="nav-item">
                <NavLink to="dc-stats" className="nav-link">
                  HOME
                </NavLink>
              </li> */}
              <li className="nav-item">
                {/* <NavLink to="dc-stats/wallet" className="nav-link"> */}
                <NavLink to="dc-stats" className="nav-link">
                  WALLET
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        {/* <Route path="dc-stats" element={<Home />} /> */}
        {/* <Route path="dc-stats/wallet" element={<Wallet />} /> */}
        <Route path="dc-stats" element={<Wallet />} />
      </Routes>
    </div>
  );
}
