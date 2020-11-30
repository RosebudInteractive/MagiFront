import * as playerActions from '../../actions/player-actions';
import {store} from '../../store/configureStore';
import {setNotifier} from "tools/player/nested-player";

let _controller = null

class PlayerNotifier{

    setMute(value) {
        store.dispatch(playerActions.setMuteState(value))
        if (_controller) _controller.setMute(value)
    }

    setRate(value) {
        store.dispatch(playerActions.setRate(value))
        if (_controller) _controller.setRate(value)
    }

    setVolume(value) {
        store.dispatch(playerActions.setVolume(value))
        if (_controller) _controller.setVolume(value)
    }

    setContentArray(value) {
        store.dispatch(playerActions.setContentArray(value))
        if (_controller) _controller.setContentArray(value)
    }

    setCurrentTime(value) {
        store.dispatch(playerActions.setCurrentTime(value))
        if (_controller) _controller.setCurrentTime(value)
    }

    setCurrentContent(value) {
        store.dispatch(playerActions.setCurrentContent(value))
        if (_controller) _controller.setCurrentTime(value)
    }

    setTitle(value) {
        store.dispatch(playerActions.setTitle(value))
        if (_controller) _controller.setTitle(value)
    }

    setBufferedTime(value) {
        store.dispatch(playerActions.setBufferedTime(value))
        if (_controller) _controller.setBufferedTime(value)
    }

    canNotPlay() {
        store.dispatch(playerActions.canNotPlay())
    }

    stop() {
        store.dispatch(playerActions.stop())
    }

    pause() {
        store.dispatch(playerActions.pause())
        if (_controller) _controller.setPaused()
    }

    play() {
        store.dispatch(playerActions.play())
        if (_controller) _controller.setPlaying()
    }

    end() {
        store.dispatch(playerActions.end())
    }
}

let _notifier = new PlayerNotifier()

setNotifier(_notifier)

export const attachPlayerController = (controller) => {
    _controller = controller
}

export const detachPlayerController = () => {
    _controller = null
}
