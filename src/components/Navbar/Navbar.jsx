import "./Navbar.css";
import { NavLink } from "react-router-dom";
import React, {useState} from 'react'
// import {faBars} from '@fortawesome/free-solid-svg-icons'
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { signOut } from "firebase/auth";
import { db , auth} from "../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { RiLogoutBoxFill } from "react-icons/ri";

import { AiTwotoneHome } from "react-icons/ai";
export const Navbar=({titles})=>{
    console.log(titles);
    const length=titles.length-1;
    const { user } = useAuth();
     const [showNavBarOptions, setShowNavBarOptions] = useState(false);

    return(
        <>
            <div style={{display:"inline-block"}}>
                <div className="outer-container" onClick={() => setShowNavBarOptions(!showNavBarOptions)}>
                    {/* <div className="salon-logo">
                        <img src="/logo.png" alt="" height={"70px"} />
                    </div> */}
                    <span className="salon-name"><p>Scissor & Style Unisex Salon</p></span>
                    <span className="salon-name2"><p></p></span>
                    <div className={ showNavBarOptions ? "nav-bar show-hamburger-options" : "nav-bar" }>  
                        <div className="nav" >
                            {titles.map((curElement,index)=>{
                                return(
                                    <div key={index} className="NavBarOption">
                                        <NavLink to={curElement.link} className="nav-link"> <div style={{display:"flex" , alignItems:"center",marginTop:"13px",marginLeft:"20px"}}>{curElement.icon} <span style={{marginLeft:"20px",paddingTop:"7px"}} >{curElement.name}</span></div></NavLink>
                                        <div className="underline"> </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <nav
                        style={{
                            position: "absolute",
                            top: "1px",
                            left: "1px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px", // Adds spacing if needed for future elements
                            background: "rgba(0, 0, 0, 0.6)", // Semi-transparent background for better visibility
                            padding: "10px 15px",
                            borderRadius: "8px",
                        }}
                        >
                        {user && (
                            <button
                            onClick={() => signOut(auth)}
                            style={{
                                background: "#ff4d4d", // Red logout button
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "bold",
                                transition: "background 0.3s",
                            }}
                            onMouseOver={(e) => (e.target.style.background = "#e60000")}
                            onMouseOut={(e) => (e.target.style.background = "#ff4d4d")}
                            >
                            Logout
                            </button>
                        )}
                    </nav>


                    {/* <div className="header-hamburger" onClick={() => setShowNavBarOptions(!showNavBarOptions)} >
                        <FontAwesomeIcon className="header-hamburger-bars" icon={faBars} style={{color: "var(--black)"}} />
                    </div> */}
                </div>
            </div>
       </> 
    )
}