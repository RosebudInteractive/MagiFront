import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {getLessonBookmarks, removeLessonFromBookmarks} from '../../ducks/profile'
import {bindActionCreators} from "redux";
import * as storageActions from "../../actions/lesson-info-storage-actions";
import Item from "./lesson-item";

const _pagingSize = 10;

class LessonsBlock extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this._visibleCount = 0;
    }

    componentWillMount() {
        this.props.storageActions.refreshState();
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        if ((this._visibleCount === 0) && (this.props.bookmarks.size > 0)) {
            this._getMoreBookmarks();
        }
    }

    _getList() {
        let {bookmarks} = this.props,
            _result = [];

        if (this._visibleCount > this.props.bookmarks.size) {
            this._visibleCount = this.props.bookmarks.size
        }

        for (let i = 0; i < this._visibleCount; i++) {
            _result.push(<Item item={bookmarks.get(i)} key={i} onRemoveItem={::this.props.removeLessonFromBookmarks}/>)
        }

        return _result
    }

    _getMoreBookmarks() {
        let {bookmarks} = this.props,
            _newSize = this._visibleCount + _pagingSize,
            _oldSize = this._visibleCount;

        this._visibleCount = (_newSize) < bookmarks.size ? _newSize : bookmarks.size;

        if (_oldSize !== this._visibleCount) {
            this.forceUpdate();
        }
    }

    render() {
        let {bookmarks} = this.props;

        return (
            <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                <div className="history-list">
                    {this._getList()}
                    {
                        (this._visibleCount !== bookmarks.length)
                            ?
                            <button className="btn btn--white history-list__link"
                                    onClick={::this._getMoreBookmarks}>Больше лекций</button>
                            :
                            null
                    }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        bookmarks: getLessonBookmarks(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsBlock);