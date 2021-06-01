import {USER_ROLE} from "../constants/common";
import {TASK_STATE} from "../constants/states";

export type TaskFieldsEnable = {
    form: boolean,
    taskName: boolean,
    description: boolean,
    processFields: boolean,
    state: boolean,
    dueDate: boolean,
    executor: boolean,
    elements: boolean,
    comments: boolean,
}

export type TaskFieldsVisibility = {
    startButton: boolean,
    processFields: boolean,
    writeFieldSet: boolean,
    elementField: boolean,
}

class TaskController {
    constructor() {
        this.user = null
        this.task = null
        this._enable = { }
        this._visibility = { }
        this._setInitState()
        this._newStates = [TASK_STATE.EXECUTING.value, TASK_STATE.QUESTION.value, TASK_STATE.DONE.value]
    }

    get fieldsEnable(): TaskFieldsEnable{
        return this._enable
    }

    get visibility(): TaskFieldsVisibility{
        return this._visibility
    }

    get newStates() : Array {
        return this._newStates
    }

    setUser(user) {
        this.user = user
        this.calcAvailability()
    }

    setTask(task) {
        this.task = task
        this.calcAvailability()
    }

    /*
    CqHash: "535cb361197eb8d1ecc6fbec306b232d3234e27f2eb9fa0e5fa04fd264351a09"
    DisplayName: "Alexander Staloverov"
    Email: "staloverov@rosebud.ru"
    Id: 2
    Name: "Alexander"
    PData:
        isAdmin: true
        roles:
            pma: 1
            s: 1
    SubsExpDate: null
    SubsExpDateExt: null
     */

    /*
    AlertId: null
    Description: ""
    DueDate: "2021-04-30T09:52:00.000Z"
    Executor:
        DisplayName: "Alexander Staloverov"
        Id: 2
    Id: 47
    IsElemReady: true
    Log: []
    Name: " Новая задача с длинным названием в несколько строчек"
    Process:
        Id: 2
        Name: "Тестовый процесс номер 1"
    State: 2
    TimeCr: "2021-04-01T09:54:18.000Z"
    UserLastComment: null
    WriteFieldSet: "set #1"
     */

    calcAvailability() {
        if (!this.user) return

        const role = this._getUserRole(this.user)

        this._setInitState()

        switch (role) {
            case USER_ROLE.ADMIN: { this._calcAdmin(); break }
            case USER_ROLE.PMA: { this._calcAdmin(); break }
            case USER_ROLE.PMS: { this._calcSupervisor(); break }
            case USER_ROLE.PME: { this._calcElementResponsible(); break }
            case USER_ROLE.PMU: { this._calcUser(); break }

            default: this._setInitState()
        }

    }

    _getUserRole(user) {
        return user.PData.isAdmin ?
            USER_ROLE.ADMIN
            :
            user.PData.roles.pma ?
                USER_ROLE.PMA
                :
                user.PData.roles.pms ?
                    USER_ROLE.PMS
                    :
                    user.PData.roles.pme ?
                        USER_ROLE.PME
                        :
                        user.PData.roles.pmu ?
                            USER_ROLE.PMU
                            :
                            null
    }

    _calcAdmin() {
        if (!this.task) return

        this._enable.form = true
        this._enable.taskName = true
        this._enable.description = true
        this._enable.processFields = true
        this._enable.state = true
        this._enable.dueDate = true
        this._enable.executor = true
        this._enable.elements = true
        this._enable.comments = true

        this._visibility.writeFieldSet = true

        if (this.task.Executor && (this.task.Executor.Id === this.user.Id) && (this.task.State === TASK_STATE.DRAFT.value)) {
            this._visibility.startButton = true
            this._visibility.elementField = false
            this._visibility.processFields = false
        }
    }

    _calcSupervisor() {
        if (!this.task) return

        this._enable.form = true
        this._enable.taskName = true
        this._enable.description = true
        this._enable.processFields = true
        this._enable.state = true
        this._enable.dueDate = true
        this._enable.executor = true
        this._enable.elements = true
        this._enable.comments = true

        this._visibility.writeFieldSet = true

        if (this.task.Executor && (this.task.Executor.Id === this.user.Id) && (this.task.State === TASK_STATE.DRAFT.value)) {
            this._visibility.startButton = true
            this._visibility.elementField = false
            this._visibility.processFields = false
        }
    }

    _calcElementResponsible() {
        if (!this.task) return

        if (this.task.State !== TASK_STATE.DONE.value) {
            this._enable.form = true
            this._enable.executor = true
            this._enable.dueDate = true
            this._enable.state = true
            this._enable.description = true
            this._enable.comments = true
        } else {
            this._enable.state = true
            this._newStates = [TASK_STATE.EXECUTING.value]
        }

        if (this.task.Executor && (this.task.Executor.Id === this.user.Id) && (this.task.State === TASK_STATE.DRAFT.value)) {
            this._visibility.startButton = true
            this._visibility.elementField = false
            this._visibility.processFields = false
        }
    }

    _calcUser() {
        if (!this.task) return

        if ((this.task.State > TASK_STATE.DRAFT.value) && (this.task.State !== TASK_STATE.DONE.value)) {
            this._enable.form = true
            this._enable.processFields = true
            this._enable.state = true
            this._enable.comments = true
        }

        if (this.task.State === TASK_STATE.DRAFT.value) {
            this._visibility.startButton = true
            this._visibility.elementField = false
            this._visibility.processFields = false
        }

        // if (this.task.State === TASK_STATE.QUESTION.value) {
        //     this._enable.state = true
        // }

        if (this.task.State === TASK_STATE.DONE.value) {
            this._enable.form = true
            this._enable.state = true
            this._newStates = [TASK_STATE.EXECUTING.value]
        }
    }

    _setInitState() {
        this._enable = {
            form: false,
            taskName: false,
            description: false,
            processFields: false,
            state: false,
            dueDate: false,
            executor: false,
            elements: false,
            comments: false,
        }

        this._visibility = {
            startButton: false,
            processFields: true,
            writeFieldSet: false,
            elementField: true,
        }
    }
}

const taskController = new TaskController()

export default taskController
