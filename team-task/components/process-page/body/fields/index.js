import React from "react"
import "./fields.sass"
import {Field} from "redux-form";
import {TextBox} from "../../../ui-kit";
import {PROCESS_FIELDS} from "../../../../constants/process";

const ProcessFieldsProps = {
    fields: Array
}



export default function ProcessFields() {

    return <div className="process-body__fields">
        <h6 className="process-fields__title _grey100">Поля процесса</h6>
        {
            PROCESS_FIELDS.map((item, index) => {
                // const enable = enabledFields && enabledFields.includes(item.name)
                return <Field component={TextBox} name={item} label={item} key={index}/>
            })
        }
    </div>
}


