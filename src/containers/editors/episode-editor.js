import React from "react"
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {get as getEpisode, create as createEpisode} from "../../actions/episode/episode-actions";
import {get as getLesson} from "../../actions/lesson/lesson-actions";
import {loadData as loadWorkShopData} from '../../actions/work-shop-actions';
import LoadingPage from "../../components/common/loading-page";
import EditorForm from "../../components/episode-editor/editor-form";
import ErrorDialog from "../../components/dialog/error-dialog";

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
        let {episodeId} = this.props

        this._loadLessonInfo()
            .then(() => {
                if (this.state.editMode) {
                    this.props.getEpisode(episodeId, this.lessonId)
                } else {
                    this.props.createEpisode(this._getNewEpisode())
                }

                this.setState({loading : false})
            })

        if (this.props.isWorkshop) {
            this._openWorkshop()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let {courseId, lessonId, subLessonId,} = this.props

        let _needRefreshAfterSave = prevProps.savingEpisode && !this.props.savingEpisode && !this.props.episodeError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/courses/edit/${courseId}/lessons/edit/${lessonId}`;
            if (subLessonId) {
                _newRout += `/sub-lessons/edit${subLessonId}`
            }
            _newRout += `/episodes/edit/${this.props.episode.id}`

            this.props.history.push(_newRout);
            this.setState({editMode: true})
        }

        if (_needRefreshAfterSave) {
            this.props.getEpisode(this.props.episode.id, this.lessonId)
        }


        if (this.props.isWorkshop && !prevProps.isWorkshop) {
            this._openWorkshop()
        }

        if (!this.props.fetching && prevProps.fetching) {
            this._fillFileId()
        }
    }

    componentWillReceiveProps(next) {
        this._isWorkShopRout = this.props.isWorkshop || next.isWorkshop;
    }

    render() {
        let {fetching, courseId, lessonId, subLessonId,} = this.props

        return fetching || this.state.loading ?
            <LoadingPage/>
            :
            <div className="editor episode_editor">
                <EditorForm editMode={this.state.editMode} courseId={courseId} lessonId={lessonId} sublessonId={subLessonId}/>
                <ErrorDialog/>
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

    _fillFileId() {
        let {content, resources} = this.props;

        content.forEach((item) => {
            let _resource = resources.find((resource) => {
                return resource.Id === item.ResourceId
            })

            item.FileId = _resource ? _resource.FileId : null;
        })
    }

    _openWorkshop() {
        let {episodeId, location} = this.props;

        if (this.lessonId && episodeId) {
            let _object = {
                lessonId: this.lessonId,
                episodeId: episodeId,
                callingRoute: location.pathname,
            }

            this.props.loadWorkShopData(_object)
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

        savingEpisode: state.singleEpisode.saving,
        episodeError: state.singleEpisode.error,

        content: state.episodeContent.current,
        resources: state.lessonResources.current,

        fetching: state.singleLesson.fetching || state.singleEpisode.fetching || state.lessonResources.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getLesson, getEpisode, createEpisode, loadWorkShopData}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditor)