import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBox} from "../../../ui-kit";
import SupervisorBlock from "./supervisor-block";
import ProcessFields from "./process-fields";
import "./main-block.sass"
import {TASK_STATE} from "../../../../constants/states";
import {UserStartBlock} from "./user-start-block";
import {USER_ROLE} from "../../../../constants/common";

type TaskBodyProps = {
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: string,
    isSupervisor: boolean,
    taskState: number,
    userRole: string,
    onStartClick: Function
}

export default function TaskMainBlock(props: TaskBodyProps) {
    const {isSupervisor, currentElement, elements, currentWriteFieldSet, taskState, userRole, isReadOnly} = props

    const _enabledFields = currentWriteFieldSet && currentElement.WriteSets[currentWriteFieldSet]

    const _showUserStartBlock = !isSupervisor && taskState === TASK_STATE.DRAFT.value

    const _isUserRole = userRole === USER_ROLE.PMU

    return <div className="body__main-block">
        <div className={"task-main-block__description"}>
            <Field component={TextBox} name={"Description"} label={"Описание"} disabled={_isUserRole || isReadOnly} readOnly={_isUserRole || isReadOnly}/>
        </div>
        { _showUserStartBlock && <UserStartBlock onStartClick={props.onStartClick} isReadOnly={isReadOnly}/> }
        { isSupervisor && <SupervisorBlock elements={elements} currentElement={currentElement}/> }
        { !_showUserStartBlock && <ProcessFields fields={currentElement.Fields} enabledFields={_enabledFields || isReadOnly} /> }
    </div>
}
