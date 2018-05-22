import {store} from '../../store/configureStore';
import * as storageActions from '../../actions/lesson-info-storage-actions';

let _instance = null;
const syncTimeout = {position: 15, local: 5};

export default class LessonInfoStorage {
    constructor() {
        this._init()
    }

    _init() {
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
                let _map = _obj.lessons ? objectToMap(_obj.lessons) : new Map(),
                    _volume = _obj.volume;

                store.dispatch(storageActions.setInitialState(_map));

                if (_volume !== undefined) {
                    store.dispatch(storageActions.setVolume(_volume))
                }
            }
        } else {
            let _userId = store.getState().user.user.Id;
            let _jsonObj = localStorage.getItem(_userId);
            if (_jsonObj) {
                let _obj = JSON.parse(_jsonObj),
                    _volume = _obj.volume;

                if (_volume !== undefined) {
                    store.dispatch(storageActions.setVolume(_volume))
                }
            }

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
            let _map = mapToObject(_state.lessons),
                _object = {lessons: _map, volume: _state.volume}

            localStorage.setItem(_userId, JSON.stringify(_object));
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
                console.log(JSON.stringify(_dbObj))
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
            let _pos = Math.round(value.currentTime * 100) / 100;

            if (key === _playingLessonId) {
                let _lessonsMap = _state.lessonInfoStorage.lessons,
                    _currentPosition = _lessonsMap.has(_playingLessonId) ? _lessonsMap.get(_playingLessonId).currentTime : 0;

                let _dt = Math.round((_currentPosition - this._dtStart) * 100) / 100,
                    _rate = _state.player.rate;

                this._dtStart = undefined;


                let _obj = {pos: _pos, dt: _dt}
                if (_rate !== 1) {
                    _obj.r = _rate
                }
                lsn[key] = _obj;
            } else {
                lsn[key] = {pos: _pos}
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

    map.forEach((value, key) => {
        _obj[key] = value
    })

    return _obj;
}

const objectToMap = (obj) => {
    let strMap = new Map(),
        _keys = Object.keys(obj);

    _keys.forEach((key) => {
        strMap.set(parseInt(key), obj[key]);
    })

    return strMap;
}