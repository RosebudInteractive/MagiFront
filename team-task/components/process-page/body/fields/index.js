import React from "react"
import "./fields.sass"
import {Field} from "redux-form";
import {Checkbox, TextBox} from "../../../ui-kit";

type ProcessFieldsProps = {
    fields: Array
}

export default function ProcessFields(props: ProcessFieldsProps) {

    return <div className="process-body__fields">
        <h6 className="process-fields__title _grey100">Поля процесса</h6>
        {
            props.fields && Object.entries(props.fields).map(([fieldName, fieldInfo], index) => {
                switch (fieldInfo.type) {
                    case 'string':
                        return <Field component={TextBox} name={fieldName} label={fieldInfo.caption} multiline={true}
                                      key={index}/>
                    case 'boolean':
                        return <Field component={Checkbox} name={fieldName} label={fieldInfo.caption} key={index}/>
                    default:
                        return <Field component={TextBox} name={fieldName} label={fieldInfo.caption} multiline={true}
                                      key={index}/>
                }
            })
        }
    </div>
}


