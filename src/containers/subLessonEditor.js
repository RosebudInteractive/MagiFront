import LessonEditor from './lessonEditor';
// import { connect } from 'react-redux';

export default class SubLessonEditor extends LessonEditor{
    _getEditRout() {
        return '/sub-lessons/edit/';
    }

    get objectIdPropName() {
        return 'subLessonId'
    }
}

// export default connect()(SubLessonEditor);