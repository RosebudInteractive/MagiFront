import * as loaderActions from '../../actions/play-info-loader-actions';
import {store} from '../../store/configureStore';

export default class PlayInfoLoader {
    static startLoadLesson(lesson) {
        store.dispatch(loaderActions.getLessonPlayInfo(lesson))
    }

    static notifyPlayInfoLoaded(data) {
        store.dispatch(loaderActions.notifyLessonPlayInfoLoaded(data))
    }
}
