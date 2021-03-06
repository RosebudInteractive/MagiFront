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
        this._startsMap = new Map();
        // this._dtStart = undefined;
        this._delta = 0;

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

    static clear() {
        store.dispatch(storageActions.clearInitialState());
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

    static calcDelta(currentPosition, newPosition, id) {
        this.getInstance()._internalCalcDelta(currentPosition, newPosition, id)
    }

    static setDeltaStart(value, id) {
        let _instance = this.getInstance();
        if (_instance._isUserAuthorized) {
            let _dtStart = _instance._getDtStartForLesson(id)
            if (_dtStart === undefined) {
                _instance._setDtStartForLesson(id, value)
            }
        }
    }

    static clearDeltaStart(id) {
        _instance._setDtStartForLesson(id, undefined)
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
            let _jsonObj = localStorage.getItem(_userId.toString());
            let _ts = 0;

            if (_jsonObj) {
                let _obj = JSON.parse(_jsonObj),
                    _map = _obj.lessons ? objectToMap(_obj.lessons) : new Map(),
                    _volume = _obj.volume;

                _ts = _obj.ts ? _obj.ts : 0;

                if (!this._checkAllLessonsHasTS(_map)) {
                    _ts = 0
                    store.dispatch(storageActions.setInitialState())
                    localStorage.removeItem(_userId.toString())
                } else {
                    store.dispatch(storageActions.setInitialState(_map))
                }

                if (_volume !== undefined) {
                    store.dispatch(storageActions.setVolume(_volume))
                }
            } else {
                store.dispatch(storageActions.setInitialState());
            }

            store.dispatch(storageActions.loadInitialStateFromDB(_ts))
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

    _getDtStartForLesson(id) {
        return this._startsMap.has(id) ? this._startsMap.get(id) : undefined
    }

    _setDtStartForLesson(id, value) {
        this._startsMap.set(id, value)
    }

    _internalCalcDelta(currentPosition, newPosition, id) {
        let _dtStart = this._getDtStartForLesson(id)

        if (_dtStart !== undefined) {
            this._delta += Math.round((currentPosition - _dtStart) * 100) / 100;
            this._setDtStartForLesson(id, newPosition);
        } else {
            console.log('delta newPos: ' + newPosition + ' currPos: ' + currentPosition)
            let _newValue = (newPosition !== undefined) ? newPosition : currentPosition
            this._setDtStartForLesson(id, _newValue)
        }
    }

    _saveForce() {
        this._saveToLocalStorage()

        if (this._isUserAuthorized) {
            this._savePositionToDB()
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
            let _userId = this._isUserAuthorized ? store.getState().user.user.Id : 'user_anon',
                _ts = _state.ts;
            let _map = mapToObject(_state.lessons),
                _object = {lessons: _map, volume: _state.volume, ts: _ts}

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
                console.log('savePositionToDB', JSON.stringify(_dbObj))
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

        if (_playingLessonId) {
            let _value = object.get(_playingLessonId);

            let _pos = _value ? (Math.round(_value.currentTime * 100) / 100) : 0,
                _lessonsMap = _state.lessonInfoStorage.lessons,
                _currentPosition = _lessonsMap.has(_playingLessonId) ? _lessonsMap.get(_playingLessonId).currentTime : 0;

            this._internalCalcDelta(_currentPosition, undefined, _playingLessonId);

            let _rate = _state.player.rate,
                _dt = this._delta;

            this._delta = 0;

            let _obj = {pos: _pos, dt: _dt}


            if (_value && _value.isFinished) {
                _obj.isFinished = true
            }

            if (_rate !== 1) {
                _obj.r = _rate
            }
            console.log('delta : ' + JSON.stringify(_obj))
            lsn[_playingLessonId] = _obj;
        }

        return {lsn}
    }

    _checkAllLessonsHasTS(map) {
        let _result = true,
            _iterator = map.values(),
            _value

        while ((_value = _iterator.next().value) && _result) {
            _result = _value.hasOwnProperty('ts')
        }

        return _result
    }
}


const convertToStorageFormat = (object) => {
    let {lsn} = object,
        _result = new Map();

    for (let key in lsn) {
        let _obj = {};
        if (lsn[key].pos !== undefined) {
            _obj.currentTime = lsn[key].pos;
        }

        if (lsn[key].ts !== undefined) {
            _obj.ts = lsn[key].ts;
        }

        if (lsn[key].isFinished !== undefined) {
            _obj.isFinished = lsn[key].isFinished;
        }

        _result.set(parseInt(key), _obj)
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