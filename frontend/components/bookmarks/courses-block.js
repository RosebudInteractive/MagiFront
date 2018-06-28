import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {getCourseBookmarks, removeCourseFromBookmarks} from '../../ducks/profile'
import {bindActionCreators} from "redux";
import * as storageActions from "../../actions/lesson-info-storage-actions";
import Item from "./course-item";

class LessonsBlock extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
    }

    constructor(props) {
        super(props);
    }

    _getList() {
        let {bookmarks} = this.props;

        return (bookmarks.size > 0) ?
            bookmarks.map((item, index) => {
                return <Item item={item} key={index} onRemoveItem={::this.props.removeCourseFromBookmarks}/>
            }) :
            null
    }

    render() {
        return (
            <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                <div className="favourites">
                    {this._getList()}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        bookmarks: getCourseBookmarks(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsBlock);