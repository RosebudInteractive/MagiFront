import React, {useState} from "react"
import "./body.sass"
import HeaderRow from "./header-row";
import Schema from "./schema"
import ProcessElements from "./elements";
import ProcessFields from "./fields";

type ProcessBodyProps = {
    process: any,
    hasChanges: boolean,
    editors: Array,
    supervisors: Array,
    elements: Array,
    lessons: Array,
    onAddElement: Function,
    onUpdateElement: Function,
    onDeleteElement: Function,
    onAddTask: Function,
    onAddTaskWithLink: Function,
    onEditTaskLinks: Function,
    onEditTask: Function,
    onDeleteTask: Function,
}

export default function ProcessBody(props: ProcessBodyProps) {
    const {process, supervisors, editors, elements, lessons} = props

    const [activeElementId, setActiveElementId] = useState(null)

    const onSetActiveTask = (taskId) => {
        const _task = process.Tasks.find(item => item.Id === taskId)
        if (_task && _task.ElementId) {
            setActiveElementId(_task.ElementId)
        } else {
            setActiveElementId(null)
        }
    }

    return <div className="process-page__body">
        <HeaderRow users={supervisors} lessons={lessons}/>
        <Schema tree={props.tree}
                onSetActiveTask={onSetActiveTask}
                onAddTask={props.onAddTask}
                onAddTaskWithLink={props.onAddTaskWithLink}
                onEditTaskLinks={props.onEditTaskLinks}
                onEditTask={props.onEditTask}
                onDeleteTask={props.onDeleteTask}/>
        <ProcessElements values={process.Elements}
                         activeElementId={activeElementId}
                         disabled={props.hasChanges}
                         editors={editors}
                         elements={elements}
                         onAdd={props.onAddElement}
                         onUpdate={props.onUpdateElement}
                         onDelete={props.onDeleteElement}/>
        <ProcessFields fields={process.ProcessFields}/>
    </div>
}
