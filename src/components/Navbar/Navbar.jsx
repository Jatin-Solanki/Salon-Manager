import "./Navbar.css";
import { NavLink } from "react-router-dom";
import React, {useState} from 'react'
// import {faBars} from '@fortawesome/free-solid-svg-icons'
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { AiTwotoneHome } from "react-icons/ai";
export const Navbar=({titles})=>{
    console.log(titles);
    const length=titles.length-1;

     const [showNavBarOptions, setShowNavBarOptions] = useState(false);

    return(
        <>
            <div style={{display:"inline-block"}}>
                <div className="outer-container" onClick={() => setShowNavBarOptions(!showNavBarOptions)}>
                    <div className="salon-logo">
                        <img src="./public/logo.png" alt="" height={"70px"} />
                    </div>
                    <span className="salon-name"><p>Scissor & Style</p></span>
                    <span className="salon-name2"><p>Unisex Salon</p></span>
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

                    {/* <div className="header-hamburger" onClick={() => setShowNavBarOptions(!showNavBarOptions)} >
                        <FontAwesomeIcon className="header-hamburger-bars" icon={faBars} style={{color: "var(--black)"}} />
                    </div> */}
                </div>
            </div>
       </> 
    )
}