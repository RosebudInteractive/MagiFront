import {setNotifier} from "tools/player/nested-player";

let _controller = null

class PlayerNotifier{

    setMute(value) {
        if (_controller) _controller.setMute(value)
    }

    setRate(value) {
        if (_controller) _controller.setRate(value)
    }

    setVolume(value) {
        if (_controller) _controller.setVolume(value)
    }

    setContentArray(value) {
        if (_controller) _controller.setContentArray(value)
    }

    setCurrentTime(value) {
        if (_controller) _controller.setCurrentTime(value)
    }

    setCurrentContent(value) {
        if (_controller) _controller.setCurrentContent(value)
    }

    setTitle(value) {
        if (_controller) _controller.setTitle(value)
    }

    setBufferedTime(value) {
        if (_controller) _controller.setBufferedTime(value)
    }

    canNotPlay() {
    }

    stop() {
        if (_controller) _controller.setPaused()
    }

    pause() {
        if (_controller) _controller.setPaused()
    }

    play() {
        if (_controller) _controller.setPlaying()
    }

    end() {
        if (_controller) _controller.setFinished()
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