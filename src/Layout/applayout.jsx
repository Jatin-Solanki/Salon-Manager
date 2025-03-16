import{Outlet} from "react-router-dom"
import { Navbar } from "../components/Navbar/Navbar"
import { FaHome } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { RiApps2AddFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import { GiExpense } from "react-icons/gi";
let titles=[
    {name:"Home",link:"/" ,icon:<FaHome size={30} /> },
    {name:"ADD Barber",link:"/about",icon:<IoMdPersonAdd size={30} />},
    {name:"ADD Items",link:"/lab",icon:<RiApps2AddFill size={30} />},
    {name:"Sells Report",link:"/publication",icon:<TbReport size={30} />},
    {name:"ADD Expense",link:"/expense",icon:<GiExpense size={30} />},
]
export const AppLayout=()=>{
    return(
        <>
            <div style={{textAlign:"center" ,backgroundColor:"red" ,width:"50%" ,position:"absolute",right:"20px"}}>
                <h1 style={{display:"inline-block"}}>Salon Manager</h1>
            </div>
            
            <div style={{display:"flex"}}>
                <Navbar titles={titles}/>
                
                <Outlet/>
            </div>
        </>
    )
}