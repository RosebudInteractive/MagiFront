import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as playerStartActions from '../../actions/player-start-actions'

class PauseScreen extends React.Component {
    static propTypes = {
        isMain: PropTypes.bool,
        duration: PropTypes.string,
        number: PropTypes.number,
    };

    static defaultProps = {
        isMain: true,
    };

    _startPlay() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.playerStartActions.startPlay({lessonId: this.props.lesson.Id})
    }

    render() {
        let {lesson, isFinished} = this.props;
        let _number = this.props.isMain ? (lesson.Number + '. ') : (lesson.Number + ' ');
        let _toc = this.props.currentContent ? this.props.currentContent.title : '';

        const _style = {cursor: 'pointer'};

        const _plus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#plus"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lecture-replay"/>';

        return (
            <div className={"player-frame__screen" + (isFinished ? " finished" : "") + (this.props.paused ? "" : " hide")}></div>
        )
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        currentContent: state.player.currentContent,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PauseScreen);