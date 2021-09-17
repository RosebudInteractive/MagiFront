import React, {useState} from "react";
import {DatePicker} from "../../../components/ui-kit";

function ConfirmationOfPublication(props) {

    const [value, setValue] = useState(new Date());
    return (
        <div className={'confirmation-of-publication'}>

            <DatePicker input={<input />}/>

            <button type={"button"} className={'big-button'}>ok</button>
        </div>
    )
}

export default ConfirmationOfPublication;
