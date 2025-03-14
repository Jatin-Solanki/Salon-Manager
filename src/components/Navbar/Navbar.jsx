import "./Navbar.css";
import { NavLink } from "react-router-dom";
import React, {useState} from 'react'
// import {faBars} from '@fortawesome/free-solid-svg-icons'
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

export const Navbar=({titles})=>{
    console.log(titles);
    const length=titles.length-1;

     const [showNavBarOptions, setShowNavBarOptions] = useState(false);

    return(
        <>
            <div style={{display:"inline-block"}}>
                <div className="outer-container" onClick={() => setShowNavBarOptions(!showNavBarOptions)}>
                    <div className={ showNavBarOptions ? "nav-bar show-hamburger-options" : "nav-bar" }>  
                        <div className="nav" >
                            {titles.map((curElement,index)=>{
                                return(
                                    <div key={index} className="NavBarOption">
                                        <NavLink to={curElement.link} className="nav-link">{curElement.name}</NavLink>
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