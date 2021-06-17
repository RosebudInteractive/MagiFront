export const FILTER_KEY = {
    TASKS: "tasks",
    PROCESSES: "processes"
}

const LOCAL_STORAGE_KEY = "TM_FILTERS"

class SavedFilters {
    constructor() {
        this._currentValue = {}
    }

    clear() {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
    }

    setFor(key, filter) {
        this._currentValue[key] = filter
    }

    getFor(key) {
        return this._currentValue.hasOwnProperty(key) ? {...this._currentValue[key]} : {}
    }
}


const savedFilters = new SavedFilters()
export default savedFilters
