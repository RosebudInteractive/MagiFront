import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {
    getLessonBookmarks,
    removeLessonFromBookmarks,
    addLessonToBookmarks,
    userBookmarksSelector
} from '../../ducks/profile'
import {bindActionCreators} from "redux";
import * as storageActions from "../../actions/lesson-info-storage-actions";
import Item from "./lesson-item";
import Message from "./favourites-message";

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

    _favoritesClick(lesson) {
        if (this._isLessonInBookmarks(lesson)) {
            this.props.removeLessonFromBookmarks(lesson.courseUrl, lesson.URL)
        } else {
            this.props.addLessonToBookmarks(lesson.courseUrl, lesson.URL)
        }
    }

    _isLessonInBookmarks(lesson) {
        return this.props.userBookmarks && this.props.userBookmarks.find((item) => {
            return item === lesson.courseUrl + '/' + lesson.URL
        })
    }


    _getList() {
        let {bookmarks} = this.props,
            _result = [];

        for (let i = 0; i < this._visibleCount; i++) {
            let _item = bookmarks.get(i);
            _result.push(<Item item={_item} key={i} onRemoveItem={::this._favoritesClick}
                               isFavorite={this._isLessonInBookmarks(_item)}/>)
        }

        return (_result.length > 0) ? _result : <Message/>
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

        if (this._visibleCount > this.props.bookmarks.size) {
            this._visibleCount = this.props.bookmarks.size
        }

        return (
            <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                <div className="history-list">
                    {this._getList()}
                    {
                        ((bookmarks.size > 0) && (this._visibleCount < bookmarks.size))
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
        userBookmarks: userBookmarksSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
        addLessonToBookmarks: bindActionCreators(addLessonToBookmarks, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsBlock);