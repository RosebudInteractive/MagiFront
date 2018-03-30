import * as lessonActions from '../../actions/lesson-actions';
import {store} from '../../store/configureStore';

export default class  PlayInfoLoader {
    static startLoadLesson(lesson) {
        store.dispatch(lessonActions.getLessonPlayInfo(lesson.Id))
    }


}