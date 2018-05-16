import {store} from '../../store/configureStore';
import * as storageActions from '../../actions/lesson-info-storage-actions';

let _instance = null;
const syncTimeout = {position: 15, local: 5};

export default class LessonInfoStorage {
    constructor() {
        this._init()
    }

    _init() {
        this._saveForce();
        this._clearTimers();

        this._isUserAuthorized = !!store.getState().user.user;
        this._localTimer = null;
        this._positionTimer = null;
        this._dtStart = undefined;

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

    static applyLoadedPosition(data) {
        let _map = convertToStorageFormat(data);

        store.dispatch(storageActions.setInitialState(_map));
        this.getInstance()._saveToLocalStorage();
    }

    static hasChangedPosition(newPosition) {
        this.getInstance().save(newPosition)
    }

    static saveChanges() {
        this.getInstance()._saveForce();
    }

    static setDeltaStart(value) {
        let _instance = this.getInstance();
        if (_instance._isUserAuthorized) {
            if (_instance._dtStart === undefined) {
                _instance._dtStart = value;
            }
        }
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
            this._localTimer = setTimeout(::this._saveToLocalStorage, syncTimeout.local * 1000)
        }

        if (this._isUserAuthorized) {
            if (!this._positionTimer) {
                this._positionTimer = setTimeout(::this._savePositionToDB, syncTimeout.position * 1000)
            }
        }
    }

    _saveForce() {
        if (this._localTimer) {
            this._saveToLocalStorage()
        }

        if (this._isUserAuthorized) {
            if (this._positionTimer) {
                this._savePositionToDB()
            }
        }
    }

    _clearTimers() {
        if (this._localTimer) {
            clearTimeout(this._localTimer)
            this._localTimer = null;
        }

        if (this._positionTimer) {
            clearTimeout(this._positionTimer)
            this._positionTimer = null;
        }
    }

    _saveToLocalStorage() {
        let _state = store.getState().lessonInfoStorage;
        if (_state.lessons.size > 0) {
            let _userId = this._isUserAuthorized ? store.getState().user.user.Id : 'user_anon'
            localStorage.setItem(_userId, JSON.stringify(mapToObject(_state.lessons)));
        }

        if (this._localTimer) {
            clearTimeout(this._localTimer)
            this._localTimer = null;
        }
    }

    _savePositionToDB() {
        this._saveToLocalStorage();

        if (this._isUserAuthorized) {
            let _state = store.getState().lessonInfoStorage;
            if (_state.lessons.size > 0) {
                let _dbObj = this._convertToDbFormat(_state.lessons)
                store.dispatch(storageActions.updateDbState(_dbObj))
            }
        }

        clearTimeout(this._positionTimer)
        this._positionTimer = null;
    }

    _convertToDbFormat(object) {
        let _state = store.getState(),
            _isPlayingLessonExists = !!_state.player.playingLesson,
            _playingLessonId = _isPlayingLessonExists ? _state.player.playingLesson.lessonId : null;

        let lsn = {};
        object.forEach((value, key) => {
            if (key === _playingLessonId) {
                let _lessonsMap = _state.lessonInfoStorage.lessons,
                    _currentPosition = _lessonsMap.has(_playingLessonId) ? _lessonsMap.get(_playingLessonId).currentTime : 0;

                let _dt = _currentPosition - this._dtStart,
                    _rate = _state.player.rate;

                this._dtStart = undefined;

                lsn[key] = {pos: value.currentTime, dt: _dt, r: _rate}
            } else {
                lsn[key] = {pos: value.currentTime}
            }

        })

        return {lsn}
    }
}


const convertToStorageFormat = (object) => {
    let {lsn} = object,
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