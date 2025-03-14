import { useState } from "react";
import './form.css'
// import { Building } from "../../components/Building/Building";
export const RegistrationForm=({properties , setProperties ,form_visibility_css,setFormVisibilityCss})=>{
    const[propertyName,setPropertyName]=useState("");
    const[noOfUnits,setNoOfUnits]=useState("");
    // cancel button
    const handleButtonClick=()=>{
        setFormVisibilityCss(()=>"form-closed")
    }
    const handleInputChange=(e)=>{
        const{name,value}=e.target;
        switch(name){
            case "propertyName":
                setPropertyName(e.target.value);
                break;
            case "noOfUnits":
                setNoOfUnits(e.target.value);
                break;
        }
    }
    
    const handleFormSubmit=(event)=>
    {
        event.preventDefault();
        const formData = {
            propertyName: propertyName,
            noOfUnits: noOfUnits,
            Rooms: []  // Initialize as an empty array
        };
        
        for (let i = 0; i < formData.noOfUnits; i++) {  // Use dot notation for clarity
            formData.Rooms.push({  // Use push to add objects to the array
                Name: "Jatin",
                phoneNo: "",
                NumMembers: 0,
                RentAmount: 0
            });
        }
        console.log(formData);

        // Updating properties array
        setProperties((prev)=>[...prev, formData]);

        // Reset the form fields
        setPropertyName("");
        setNoOfUnits("");
    }
    return(
        <>
            <form onSubmit={handleFormSubmit} className="formvisi" >
                <div className="conatiner">
                    <label htmlFor="propertyName">
                        <b>Property Name</b>
                    </label>
                    <input type="text"
                            name="propertyName"
                            placeholder="Enter Property Name" 
                            value={propertyName}
                            onChange={handleInputChange}
                    />
                    <br />
                    <label htmlFor="noOfUnits">
                        <b>No. of Units</b>
                    </label>
                    <input type="text"
                            name="noOfUnits"
                            placeholder="Enter No. of Units" 
                            value={noOfUnits}
                            onChange={handleInputChange}
                    />
                </div>
                <button type="submit">
                    Submit
                </button>
            </form>
            <button className="cancel-button" onClick={handleButtonClick} >cancel</button>
            {/* <Building { ...properties={properties}}/> */}
        </>
    )
}