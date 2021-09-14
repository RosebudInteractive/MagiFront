import React, {useState} from "react";
import {DatePicker} from "../../../components/ui-kit";

function ConfirmationOfPublication(props) {

    const [value, setValue] = useState(new Date());
    return (
        <div className={'confirmation-of-publication'}>

            <DatePicker input={<input />}/>

            <button type={"button"} className={'big-button'}>ok</button>
            {/*<KeyboardDatePicker variant="inline"*/}
            {/*                    color={'primary'}*/}
            {/*                    format="MM/dd/yyyy"*/}
            {/*                    margin="normal"*/}
            {/*                    id="date-picker-inline"*/}
            {/*                    label="Date picker inline"*/}
            {/*                    value={value}*/}
            {/*                    onChange={(val) => setValue(val)}*/}
            {/*                    KeyboardButtonProps={{*/}
            {/*                        'aria-label': 'change date',*/}
            {/*                    }}/>*/}

            {/*<Field component={DatePicker} name={"DueDate"} label={"Дата исполнения"}/>*/}
        </div>
    )
}

export default ConfirmationOfPublication;
