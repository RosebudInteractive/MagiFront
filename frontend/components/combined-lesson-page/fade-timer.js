import $ from 'jquery'
import {store} from '../../store/configureStore';
import {hideScreenControls, showScreenControls, clearAll, setFade, clearFade} from '../../ducks/player-screen'

const _timeout = 5000;

export default class FadeTimer {

    constructor() {
        this._timer = null;
        store.dispatch(clearAll())
    }

    start() {
        let _state = store.getState(),
            _paused = _state.player.paused;

        if (!_paused) {
            this._timer = setTimeout(() => {
                let _state = store.getState(),
                    _hasOpenedMenu = _state.player.showContentTooltip ||
                        _state.player.showSpeedTooltip ||
                        _state.app.isLessonMenuOpened,
                    _paused = _state.player.paused;

                if (!_paused) {
                    this.hideScreenControls();

                    if (!_hasOpenedMenu) {
                        this._fade()
                    }
                }
            }, _timeout)
        } else {
            this._timer = null;
        }

    }

    restart() {
        this.stop();
        this.start();
    }

    stop() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this.showScreenContols();
        this.clearFade();
    }

    clearFade() {
        store.dispatch(clearFade())
        $('body').removeClass('fade');
    }

    _fade() {
        let _added = $('.js-player').hasClass('added');

        if (!_added) {
            store.dispatch(setFade())
            $('body').addClass('fade');
        }
    }

    hideScreenControls() {
        let _state = store.getState();
        if (!_state.player.paused) {
            store.dispatch(hideScreenControls())
            $('.player-block__controls').removeClass('show')
            $('.lecture-frame__play-block-wrapper').addClass('fade');
        }
    }

    forceHideScreenControls() {
        $('.lecture-frame__play-block-wrapper').addClass('force-hide')
        this.hideScreenControls()
        setTimeout(() => {
            $('.lecture-frame__play-block-wrapper').removeClass('force-hide')
        }, 500)
    }

    showScreenContols() {
        store.dispatch(showScreenControls())
        $('.player-block__controls').addClass('show')
        $('.lecture-frame__play-block-wrapper').removeClass('fade');
    }
}
