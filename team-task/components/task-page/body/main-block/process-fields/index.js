import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBox, Checkbox} from "../../../../ui-kit";
import "./process-fields.sass"

type ProcessFieldsProps = {
    fields: Array,
    enabledFields: ?Array,
    readOnly: boolean,
}

export default function ProcessFields(props: ProcessFieldsProps) {
    const {fields, enabledFields, readOnly} = props

    return <div className="body__process-fields">
        <div className="font-h7 _grey100">Поля процесса</div>
        {
            fields.map((item, index) => {
                const enable = !readOnly && enabledFields && enabledFields.includes(item.name)
                switch (item.type) {
                    case 'string':
                        return <Field component={TextBox} multiline={true} name={item.name} label={item.caption} disabled={!enable} readOnly={!enable} key={index}/>

                    case 'boolean':
                        return <Field component={Checkbox} name={item.name} label={item.caption} disabled={!enable} readOnly={!enable} key={index}/>

                    default:
                        return <Field component={TextBox} multiline={true} name={item.name} label={item.caption} disabled={!enable} readOnly={!enable} key={index}/>
                }
            })
        }
    </div>
}
