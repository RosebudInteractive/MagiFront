import React, {useMemo, useCallback} from "react"
import {Field} from "redux-form";
import {DatePicker, Select, TextBox} from "../../../ui-kit";
import CommentBlock, {Comment} from "./сomment-block";
import "./right-block.sass"
import {TASK_STATE} from "../../../../constants/states";
import taskController from "../../../../tools/task-controller";

type TaskBodyProps = {
    users: Array,
    task: any,
    onSaveComment: Function,
    taskTypes: any,
    editorValues: any,
}

export default function RightBlock(props) {
    const {task, users, onSaveComment, taskTypes, editorValues} = props

    const _stateOptions = useMemo(() => {
        return Object.values(TASK_STATE)
            .map((item) => {
                return taskController.newStates.includes(item.value) || (item.value === task.State) ? {id: item.value, name: item.label} : null
            })
            .filter(item => !!item)
    }, [task.State])

    const _getUsers = useCallback(() => {

        let filteredUsers = users;
        if (taskTypes && taskTypes.length && users && editorValues){
            const taskType = taskTypes.find( elem => elem.Id === editorValues.TypeId);
            if (taskType){
                const rolesOfTaskType = taskType.Roles.map( elem => elem.ShortCode );
                filteredUsers = users.filter( user => ( rolesOfTaskType.find( value => user.PData.roles[value]===1 ) ) );
            };
        };
        return filteredUsers && filteredUsers.map((item) => {return {id: item.Id, name: item.DisplayName}})
//        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }, [editorValues, taskTypes, users])

    const _getTaskTypes = () => {
        return taskTypes && taskTypes.map((item) => {return {id: item.Id, name: item.Name}})
    }

    const _lock = {
        executor: !taskController.fieldsEnable.form || !taskController.fieldsEnable.executor,
        state: !taskController.fieldsEnable.form || !taskController.fieldsEnable.state,
        dueDate: !taskController.fieldsEnable.form || !taskController.fieldsEnable.dueDate,
        comments: !taskController.fieldsEnable.form || !taskController.fieldsEnable.comments
    }

    const _alertLog = useMemo(() => {
        const _index = task.AlertId && task.Log.findIndex(item => item.Id === task.AlertId)
        if ((_index !== null) && (_index > -1)) {
            return {
                comment: task.Log[_index],
                editable: task.isUserLastComment && (_index === 0),
                isAlert: true,
                onSaveComment: onSaveComment,
                key: _index
            }
        } else {
            return null
        }
    }, [task])

    return <div className="body__right-block">
        <Field component={Select} name={"TypeId"} label={"Тип задачи"} options={_getTaskTypes()} disabled={_lock.executor} readOnly={_lock.executor}/>
        <Field component={Select} name={"ExecutorId"} label={"Исполнитель"} options={_getUsers()} disabled={_lock.executor} readOnly={_lock.executor}/>
        <Field component={Select} name={"State"} label={"Состояние"} options={_stateOptions} disabled={_lock.state} readOnly={_lock.state} required={true}/>
        { _alertLog && <Comment {..._alertLog}/> }
        <Field component={DatePicker} name={"DueDate"} label={"Дата исполнения"} disabled={_lock.dueDate} readOnly={_lock.dueDate}/>
        <Field component={TextBox} name={"LastComment"} multiline={true} label={"Комментарий"} disabled={_lock.comments} readOnly={_lock.comments}/>
        <CommentBlock task={task} onSaveComment={onSaveComment}/>
    </div>
}
