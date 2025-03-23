import{Outlet} from "react-router-dom"
import { Navbar } from "../components/Navbar/Navbar"
import { FaHome } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { RiApps2AddFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import { BsCashCoin } from "react-icons/bs";
import { FaHistory } from "react-icons/fa";
import { MdEditNote } from "react-icons/md";
import "./applayout.css";
let titles=[
    {name:"Home",link:"/applayout/home" ,icon:<FaHome size={30} /> },
    {name:"ADD Barber",link:"/applayout/about",icon:<IoMdPersonAdd size={30} />},
    {name:"ADD Services",link:"/applayout/lab",icon:<RiApps2AddFill size={30} />},
    {name:"Sells Report",link:"/applayout/publication",icon:<TbReport size={30} />},
    {name:"ADD Expense",link:"/applayout/expense",icon:<BsCashCoin size={30} />},
    {name:"History",link:"/applayout/history" , icon:<FaHistory size={25} />},
    {name:"Edit History",link:"/applayout/edithistory" , icon:<MdEditNote size={30} />}
]
export const AppLayout=()=>{
    return(
        <>
            {/* <div style={{textAlign:"center" ,backgroundColor:"red" ,width:"50%" ,position:"absolute",right:"20px"}}>
                <h1 style={{display:"inline-block"}}>Salon Manager</h1>
            </div>
             */}
            <div >
                <div>
                    <Navbar titles={titles}/>
                </div>
                <div className="right-side" >
                    <Outlet />
                </div>
                
            </div>
        </>
    )
}