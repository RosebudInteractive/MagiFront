import {TooltipTitles} from "../../tools/page-tools";
import {FINISH_DELTA_TIME} from "../../constants/player";

export const SVG = {
    PLAY: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
    REPLAY: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>',
    CROWN: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>',
    LOCK: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'
}

export function _play() {
    const {lesson} = this.props;
    this.props.playerStartActions.preinitAudios(lesson.Audios);
    this._redirect = true;
    this.forceUpdate()
    this.props.playerStartActions.startPlay(lesson.Id)
}

export function _goToLesson() {
    const {lesson, course, isAdmin} = this.props;

    let _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought),
        _needLockLessonAsPaid = _isPaidCourse && !(lesson.IsFreeInPaidCourse || isAdmin)

    if (_needLockLessonAsPaid) {
        let _currentLocation = window.location.pathname + window.location.search,
            _needLocation = '/' + course.URL + '/' + lesson.URL

        if (_currentLocation !== _needLocation) {
            let _courseInfo = {
                courseId: course.Id,
                productId: course.ProductId,
                returnUrl: _needLocation,
                firedByPlayerBlock: true,
            }

            this.props.getPaidCourseInfo(_courseInfo)
        }
    } else {
        this._play()
    }
}

export function _getTooltip(isFinished) {
    const {lesson, course, authorized} = this.props;

    let _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought),
        _tooltip = null;

    if (_isPaidCourse && !lesson.IsFreeInPaidCourse) {
        _tooltip = TooltipTitles.IS_PAID
    } else if (lesson.IsAuthRequired && !authorized) {
        _tooltip = TooltipTitles.locked
    } else {
        _tooltip = isFinished ? TooltipTitles.replay : TooltipTitles.play;
    }

    return _tooltip;
}

export function _calcIsFinishedAndPlayedPart() {
    const {lesson, lessonInfoStorage} = this.props;

    let _lessonInfo = lessonInfoStorage.lessons.get(lesson.Id),
        _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
        _totalDuration = lesson.Duration

    let _playedPart = _totalDuration ? ((_currentTime) / _totalDuration) : 0,
        _deltaTime = Math.round(_totalDuration - _currentTime);

    let result = {};

    result.playedPart = _playedPart;
    result.isFinished = _lessonInfo ? (_lessonInfo.isFinished || (_deltaTime <= FINISH_DELTA_TIME)) : false;

    return result
}

export function _unlock() {
    this.props.unlockLesson({returnUrl: `/${this.props.course.URL}/${this.props.lesson.URL}`});
}