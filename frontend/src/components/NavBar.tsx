import "../styles/NavBar.css";

import {
  House,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Plus,
} from "lucide-react";

export default function NavBar() {
  return (
    <div className="bottom-nav-wrapper">
      <svg
        className="nav-bg"
        viewBox="0 0 460 80"
        preserveAspectRatio="none"
      >
        <path
          d="M 24,0 
             L 190,0 
             C 200,0 202,4 205,10 
             C 212,28 226,40 230,40 
             C 234,40 248,28 255,10 
             C 258,4 260,0 270,0 
             L 436,0 
             C 449,0 460,11 460,24 
             L 460,56 
             C 460,69 449,80 436,80 
             L 24,80 
             C 11,80 0,69 0,56 
             L 0,24 
             C 0,11 11,0 24,0 Z"
          fill="white"
        />
      </svg>

      <div className="bottom-nav">
        <div className="nav-item active">
          <House size={26} fill="#2d5b2d" strokeWidth={2} />
          <span>Home</span>
        </div>

        <div className="nav-item">
          <ArrowLeftRight size={24} />
          <span>Transaction</span>
        </div>

        <button className="add-btn">
          <Plus size={32} strokeWidth={2.5} />
        </button>

        <div className="nav-item">
          <PieChart size={24} />
          <span>Budget</span>
        </div>

        <div className="nav-item">
          <BarChart3 size={24} />
          <span>Analytics</span>
        </div>
      </div>
    </div>
  );
}
