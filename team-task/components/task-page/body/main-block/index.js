import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import TextBox from "../../../ui-kit/text-box-with-confirm";
import SupervisorBlock from "./supervisor-block";
import ProcessFields from "./process-fields";
import "./main-block.sass"

type TaskBodyProps = {
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: string,
    isSupervisor: boolean,
}

export default function TaskMainBlock(props: TaskBodyProps) {
    const {isSupervisor, currentElement, elements, currentWriteFieldSet} = props

    const _enabledFields = currentWriteFieldSet && currentElement.WriteSets[currentWriteFieldSet]

    return <div className="body__main-block">
        <div className={"task-main-block__description"}>
            <Field component={TextBox} name={"Description"} label={"Описание"}/>
        </div>

        {isSupervisor && <SupervisorBlock elements={elements} currentElement={currentElement}/>}
        <ProcessFields fields={currentElement.Fields} enabledFields={_enabledFields}/>
    </div>
}
