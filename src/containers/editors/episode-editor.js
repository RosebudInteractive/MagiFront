import React from "react"
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {get as getEpisode, create as createEpisode} from "../../actions/episode/episode-actions";
import {get as getLesson} from "../../actions/lesson/lesson-actions";
import LoadingPage from "../../components/common/loading-page";

class EpisodeEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.episodeId > 0,
            loading: true,
        }

        window.webix.protoUI({
                name: 'myUploader',
                $updateProgress: (size, percent) => {
                    if (percent < 100) {
                        window.$$('file-name').getInputNode().style.background = "linear-gradient(to left, #f1f7ff " + (100 - percent) + "%, #75b5ff 0%)"
                    } else {
                        window.$$('file-name').getInputNode().style.background = "none"
                    }

                }
            },
            window.webix.ui.uploader)

        this._isWorkShopRout = false;
    }

    componentDidMount() {
        let {lessonId, episodeId} = this.props

        this._loadLessonInfo()
            .then(() => {
                if (this.state.editMode) {
                    this.props.getEpisode(episodeId, lessonId)
                } else {
                    this.props.createEpisode(this._getNewEpisode())
                }

                this.setState({loading : false})
            })
    }

    componentWillReceiveProps(next) {
        this._isWorkShopRout = this.props.isWorkshop || next.isWorkshop;
    }

    render() {
        let {fetching,} = this.props

        return fetching || this.state.loading ?
            <LoadingPage/>
            :
            <div className="editor episode_editor">

            </div>
    }

    get lessonId() {
        let {subLessonId, lessonId}  = this.props;

        return subLessonId ? subLessonId : lessonId
    }

    _getNewEpisode() {
        const { lesson, isSupp } = this.props;

        let _number = lesson ? (isSupp ? lesson.suppEpisodes.length : lesson.mainEpisodes.length) : 0;
        _number++;
        return {Number: _number, EpisodeType: 'L', Supp: isSupp, Name : lesson.Name + '.' + 'Эпизод ' + _number};
    }

    _loadLessonInfo() {
        const {lesson, courseId} = this.props;

        let _needLoadLesson = (!lesson) || (lesson.id !== this.lessonId)

        if (_needLoadLesson) {
            return this.props.getLesson(this.lessonId, courseId)
        } else {
            return Promise.resolve()
        }
    }



}

function mapStateToProps(state, ownProps) {
    return {
        episodeId: parseInt(ownProps.match.params.id),
        lessonId: parseInt(ownProps.match.params.lessonId),
        courseId: parseInt(ownProps.match.params.courseId),
        subLessonId: Number(ownProps.match.params.subLessonId),
        isWorkshop: ownProps.location.search === "?workshop",

        episode: state.singleEpisode.current,
        lesson: state.singleLesson.current,

        fetching: state.singleLesson.fetching || state.singleEpisode.fetching || state.lessonResources.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getLesson, getEpisode, createEpisode}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditor)