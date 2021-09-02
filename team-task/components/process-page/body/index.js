import React, {useState} from "react"
import "./body.sass"
import HeaderRow from "./header-row";
import Schema from "./schema"
import ProcessElements from "./elements";
import ProcessFields from "./fields";

type ProcessBodyProps = {
    process: any,
    isAdmin: boolean,
    horizontalProcess: boolean,
    hasChanges: boolean,
    editors: Array,
    supervisors: Array,
    elements: Array,
    lessons: Array,
    activeTaskId: ?number,
    onSetActiveTaskId:Function,
    onAddElement: Function,
    onUpdateElement: Function,
    onDeleteElement: Function,
    onAddTask: Function,
    onAddTaskWithLink: Function,
    onEditTaskLinks: Function,
    onEditTask: Function,
    onDeleteTask: Function,
    onChangeRotation: Function,
    onUpdateProcessTask: Function,
}

export default function ProcessBody(props: ProcessBodyProps) {
    const {process, supervisors, editors, elements, lessons, isAdmin} = props;

    const [activeElementId, setActiveElementId] = useState(null);

    const onSetActiveTask = (taskId) => {
        if (!taskId) {
            setActiveElementId(null)
        } else {
            const _task = process.Tasks.find(item => item.Id === taskId);
            if (_task && _task.ElementId) {
                setActiveElementId(_task.ElementId)
            } else {
                setActiveElementId(null)
            }
        }

        props.onSetActiveTaskId(taskId)
    }

    return <div className="process-page__body">
        <HeaderRow users={supervisors} lessons={lessons} isAdmin={isAdmin}/>
        <div className="work-area__left-screen"/>
        <div className="work-area__right-screen"/>
        <div className="process-page__work-area">
            <ProcessElements values={process.Elements}
                             activeElementId={activeElementId}
                             disabled={props.hasChanges}
                             editors={editors}
                             elements={elements}
                             onAdd={props.onAddElement}
                             onUpdate={props.onUpdateElement}
                             onDelete={props.onDeleteElement}/>
            <Schema tree={props.tree}
                    horizontalProcess={props.horizontalProcess}
                    activeTaskId={props.activeTaskId}
                    onSetActiveTask={onSetActiveTask}
                    onAddTask={props.onAddTask}
                    onAddTaskWithLink={props.onAddTaskWithLink}
                    onEditTaskLinks={props.onEditTaskLinks}
                    onEditTask={props.onEditTask}
                    onDeleteTask={props.onDeleteTask}
                    onUpdateProcessTask={props.onUpdateProcessTask}
                    onChangeRotation={props.onChangeRotation}/>

        </div>
        <ProcessFields fields={process.ProcessFields}/>
    </div>
}
