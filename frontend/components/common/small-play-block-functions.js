import {FINISH_DELTA_TIME} from "../../constants/player";
import {getTimeFmt} from "../../tools/time-tools";
import {TooltipTitles} from "../../tools/page-tools";

export const SMALL_SVG = {
    PLAY: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
    REPLAY: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload-small"/>',
    CROWN: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>',
    LOCK: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock-small"/>'
}

export function _play() {
    let {lesson} = this.props

    this.props.playerStartActions.preinitAudios(lesson.Audios);
    this._redirect = true;
    this.forceUpdate()
    this.props.playerStartActions.startPlay(lesson.Id)
}

export function _startPlay() {
    let {lesson} = this.props

    if (this._isLocationPlayerPage()) {
        this.props.playerStartActions.startPlay(lesson.Id);
    } else {
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay(lesson.Id);
    }
}

export function _goToLesson(isThisLessonPlaying) {
    const {lesson, course, isAdmin} = this.props;

    let _needLockLessonAsPaid = this._isPaidCourse() && !(lesson.IsFreeInPaidCourse || isAdmin)

    if (_needLockLessonAsPaid) {
        let _needLocation = '/' + this.props.lesson.courseUrl + '/' + this.props.lesson.URL

        let _courseInfo = {
            courseId: course.Id,
            productId: course.ProductId,
            returnUrl: _needLocation
        }

        if (course.IsPending) {
            this.props.getPendingCourseInfo(_courseInfo)
        } else {
            this.props.getPaidCourseInfo(_courseInfo)
        }
    } else {
        if (isThisLessonPlaying) {this._startPlay()} else {this._play()}
    }
}

export function _calcLessonProps(lesson) {
    let {lessonInfoStorage, showRestTime} = this.props,
        {Id: id, Duration: totalDuration, DurationFmt: duration} = lesson;

    let _lessonInfo = lessonInfoStorage.lessons.get(id),
        _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0;

    let _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
        _deltaTime = Math.round(totalDuration - _currentTime);

    let _isFinished = _lessonInfo ? (_lessonInfo.isFinished || (_deltaTime <= FINISH_DELTA_TIME)) : false,
        _restTime = totalDuration - _currentTime;

    _restTime = (_restTime < 0) ? 0 : _restTime;

    let result = {};

    result.playedPart = _isFinished ? 0 : _playedPart;
    result.isFinished = _isFinished;
    result.duration = (showRestTime && !_isFinished) ? getTimeFmt(_restTime) : duration;

    return result
}

export function _getTooltip(isThisLessonPlaying, isFinished) {
    const {lesson, authorized, paused} = this.props;

    let _tooltip = null;

    if (this._isPaidCourse() && !lesson.IsFreeInPaidCourse) {
        _tooltip = TooltipTitles.IS_PAID
    } else if (lesson.IsAuthRequired && !authorized) {
        _tooltip = TooltipTitles.locked
    } else {
        _tooltip = isThisLessonPlaying ?
            (paused ? (isFinished ? TooltipTitles.replay : TooltipTitles.play) : TooltipTitles.pause)
            :
            (isFinished ? TooltipTitles.replay : TooltipTitles.play);
    }

    return _tooltip;
}

export function _isLocationPlayerPage() {
    let {lesson} = this.props

    let _currentLocation = window.location.pathname + window.location.search,
        _needLocation = '/' + lesson.courseUrl + '/' + lesson.URL + '?play'

    return _currentLocation === _needLocation;
}

export function _isPaidCourse() {
    return this.props.course.IsPaid && !this.props.course.IsGift && !this.props.course.IsBought
}