import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {authorSelector, loadingSelector, getAuthor} from '../ducks/author'
import AuthorBlock from '../components/author/author-block';
import CoursesBlock from '../components/author/courses-and-lessons';

import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from "../actions/lesson-info-storage-actions";
import * as userActions from "../actions/user-actions";

import {pages} from '../tools/page-tools';

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.getAuthor(this.props.authorUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.author);
    }

    componentDidUpdate() {
        if (this.props.author) {
            document.title = 'Автор : ' + this.props.author.FirstName + ' ' + this.props.author.LastName;
        }
    }

    render() {
        let { author, loading } = this.props;

        return (
            <div>
                {
                    loading ?
                        <p>Загрузка...</p>
                        :
                        author ?
                            <div className="author-page">
                                <AuthorBlock/>
                                <CoursesBlock/>
                            </div> : null
                }
            </div>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);