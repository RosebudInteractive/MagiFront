import React from "react";
import {pages} from "../tools/page-tools";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {authorSelector, getAuthor} from "../ducks/author";
import * as pageHeaderActions from "../actions/page-header-actions";
import * as userActions from "../actions/user-actions";
import * as storageActions from "../actions/lesson-info-storage-actions";

class BookmarksPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.getAuthor(this.props.authorUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.author);
    }


    render() {
        return null
    }
}

function mapStateToProps(state, ownProps) {
    return {
        author: authorSelector(state),
        loading: loadingSelector(state),
        authorUrl: ownProps.match.params.url,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        getAuthor: bindActionCreators(getAuthor, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksPage);