import{Outlet} from "react-router-dom"
import { Navbar } from "../components/Navbar/Navbar"
let titles=[
    {name:"Billing",link:"/"},
    {name:"ADD Barber",link:"/about"},
    {name:"ADD Items",link:"/lab"},
    {name:"Check Sells",link:"/publication"},
    {name:"ADD Expense",link:"/expense"},
]
export const AppLayout=()=>{
    return(
        <>
            <div style={{marginTop:"20px", marginBottom:"20px",textAlign:"center"}}>
                <h1>Salon Manager</h1>
            </div>
            <div style={{display:"flex"}}>
                <Navbar titles={titles}/>
                
                <Outlet/>
            </div>
        </>
    )
}