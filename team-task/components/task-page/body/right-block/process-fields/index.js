import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBox} from "../../../../ui-kit";
import "./process-fields.sass"

type ProcessFieldsProps = {
    fields: Array,
}

export default function ProcessFields(props: ProcessFieldsProps) {
    const {fields} = props

    return <div className="body__process-fields">
        <div className="font-h7 _grey100">Поля процесса</div>
        {
            fields.map((item, index) => {
                return <Field component={TextBox} name={item.name} label={item.caption} disabled={item.readOnly} readOnly={item.readOnly} key={index}/>
            })
        }
    </div>
}
