import {store} from '../../store/configureStore';
import * as storageActions from '../../actions/lesson-info-storage-actions';

let _instance = null;
const syncTimeout = {position: 15, local: 5};

export default class LessonInfoStorage {
    constructor() {
        this._init()
    }

    _init() {
        this._isUserAuthorized = !!store.getState().user.user;
        this._localTimer = null;
        this._positionTimer = null;

        return this
    }

    static getInstance() {
        if (!_instance) {
            _instance = new LessonInfoStorage()
        }

        return _instance;
    }

    static init() {
        this.getInstance()._init().loadLessonsPositions()
    }

    static applyLoadedPosition(data){
        let _map = convertToStorageFormat(data);

        store.dispatch(storageActions.setInitialState(_map));
        this.getInstance()._saveToLocalStorage();
    }

    static hasChangedPosition() {
        this.getInstance().save()
    }

    loadLessonsPositions() {
        if (!this._isUserAuthorized) {
            let _jsonObj = localStorage.getItem('user_anon');
            if (_jsonObj) {
                let _obj = JSON.parse(_jsonObj)
                let _map = objectToMap(_obj);

                store.dispatch(storageActions.setInitialState(_map))
            }
        } else {
            store.dispatch(storageActions.loadInitialStateFromDB())
        }
    }

    save() {
        if (!this._localTimer) {
            this._localTimer = setTimeout(::this._saveToLocalStorage, syncTimeout.local)
        }

        if (this._isUserAuthorized) {
            if (!this._positionTimer) {
                this._positionTimer = setTimeout(::this._savePositionToDB, syncTimeout.position)
            }
        }
    }

    _saveToLocalStorage() {
        let _state = store.getState().lessonInfoStorage;
        if (_state.lessons.size > 0) {
            let _userId = this._isUserAuthorized ? store.getState().user.user.Id : 'user_anon'
            localStorage.setItem(_userId, JSON.stringify(mapToObject(_state.lessons)));
        }

        clearTimeout(this._localTimer)
        this._localTimer = null;
    }

    _savePositionToDB() {
        this._saveToLocalStorage();

        if (this._isUserAuthorized) {
            let _state = store.getState().lessonInfoStorage;
            if (_state.lessons.size > 0) {
                let _dbObj = convertToDbFormat(_state.lessons)
                store.dispatch(storageActions.updateDbState(_dbObj))
            }
        }

        clearTimeout(this._positionTimer)
        this._positionTimer = null;
    }

}

const convertToDbFormat = (object) => {
    let lsn = {};
    object.forEach((value, key) => {
        lsn[key] = {pos: value.currentTime}
    })

    return {lsn}
}

const convertToStorageFormat = (object) => {
    let {lsn}  = object,
        _result = new Map();

    for (let key in lsn) {
        _result.set(parseInt(key), {currentTime: lsn[key].pos})
    }

    return _result
}

const mapToObject = (map) => {
    let _obj = Object.create(null);

    for (let [key, value] of map) {
        _obj[key] = value;
    }

    return _obj;
}
const objectToMap = (obj) => {
    let strMap = new Map();
    for (let key of Object.keys(obj)) {
        strMap.set(parseInt(key), obj[key]);
    }
    return strMap;
}