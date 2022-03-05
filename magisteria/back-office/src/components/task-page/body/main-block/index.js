import React from "react"
import {Field} from "redux-form";
import {TextBox} from "../../../ui-kit";
import SupervisorBlock from "./supervisor-block";
import ProcessFields from "./process-fields";
import "./main-block.sass"
import {UserStartBlock} from "./user-start-block";
import taskController from "../../../../tools/task-controller";

type TaskBodyProps = {
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: string,
    onStartClick: Function
}

export default function TaskMainBlock(props: TaskBodyProps) {
    const { currentElement, elements, currentWriteFieldSet, } = props

    const _enabledFields = currentWriteFieldSet && currentElement.WriteSets[currentWriteFieldSet]

    const _lock = {
        description: !taskController.fieldsEnable.form || !taskController.fieldsEnable.description,
        processFields: !taskController.fieldsEnable.form || !taskController.fieldsEnable.processFields
    }

    return <div className="body__main-block">
        <div className={"task-main-block__description"}>
            <Field component={TextBox} name={"Description"} label={"Описание"} multiline={true} disabled={_lock.description} readOnly={_lock.description}/>
        </div>
        { taskController.visibility.startButton && <UserStartBlock onStartClick={props.onStartClick}/> }
        { taskController.visibility.elementField && <SupervisorBlock elements={elements} currentElement={currentElement}/> }
        { taskController.visibility.processFields && <ProcessFields fields={currentElement.Fields} enabledFields={_enabledFields} readOnly={_lock.processFields}/> }
    </div>
}
