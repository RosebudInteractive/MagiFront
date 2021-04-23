import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBox} from "../../../ui-kit";
import SupervisorBlock from "./supervisor-block";
import ProcessFields from "./process-fields";
import "./main-block.sass"
import {TASK_STATE} from "../../../../constants/states";
import {UserStartBlock} from "./user-start-block";

type TaskBodyProps = {
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: string,
    isSupervisor: boolean,
    taskState: number,
    onStartClick: Function
}

export default function TaskMainBlock(props: TaskBodyProps) {
    const {isSupervisor, currentElement, elements, currentWriteFieldSet, taskState} = props

    const _enabledFields = currentWriteFieldSet && currentElement.WriteSets[currentWriteFieldSet]

    const _showUserStartBlock = !isSupervisor && taskState === TASK_STATE.DRAFT.value

    return <div className="body__main-block">
        <div className={"task-main-block__description"}>
            <Field component={TextBox} name={"Description"} label={"Описание"}/>
        </div>
        { _showUserStartBlock && <UserStartBlock onStartClick={props.onStartClick}/> }
        { isSupervisor && <SupervisorBlock elements={elements} currentElement={currentElement}/> }
        { !_showUserStartBlock && <ProcessFields fields={currentElement.Fields} enabledFields={_enabledFields}/> }
    </div>
}
