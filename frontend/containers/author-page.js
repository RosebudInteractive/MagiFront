import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import MetaTags from 'react-meta-tags';

import {authorSelector, loadingSelector, getAuthor} from '../ducks/author'
import AuthorBlock from '../components/author/author-block';
import CoursesBlock from '../components/author/courses-and-lessons';

import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from "../actions/lesson-info-storage-actions";
import * as userActions from "../actions/user-actions";

import {pages, getDomain, getPageUrl,} from '../tools/page-tools';
import $ from 'jquery'

class AuthorPage extends React.Component {
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

    componentWillUnmount() {
        this._removeMetaTags();
    }

    _getMetaTags() {
        let {author, facebookAppID} = this.props,
            _url = getPageUrl(),
            _domain = getDomain(),
            _title = author ? (author.FirstName + ' ' + author.LastName + ' - Магистерия') : '';

        return author
            ?
            <MetaTags>
                <meta name="description" content={author.Description}/>
                <link rel="canonical" href={_url}/>
                <link rel="publisher" href="https://plus.google.com/111286891054263651937"/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="object"/>
                <meta property="og:title" content={_title}/>
                <meta property="og:description" content={author.Description}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={facebookAppID}/>
                <meta property="og:image" content={_domain + '/assets/images/apple-touch-icon.png'}/>
                <meta property="og:image:secure_url" content={_domain + '/assets/images/apple-touch-icon.png'}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:description" content={author.Description}/>
                <meta name="twitter:title" content={_title}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                <meta name="twitter:image" content={_domain + '/assets/images/apple-touch-icon.png'}/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>
            </MetaTags>
            :
            null
    }

    _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('link[rel="canonical"]').remove();
        $('link[rel="publisher"]').remove();
        $('meta[property="og:locale"]').remove();
        $('meta[property="og:type"]').remove();
        $('meta[property="og:title"]').remove();
        $('meta[property="og:description"]').remove();
        $('meta[property="og:url"]').remove();
        $('meta[property="og:site_name"]').remove();
        $('meta[property="fb:app_id"]').remove();
        $('meta[property="og:image"]').remove();
        $('meta[property="og:image:secure_url"]').remove();
        $('meta[name="twitter:card"]').remove();
        $('meta[name="twitter:description"]').remove();
        $('meta[name="twitter:title"]').remove();
        $('meta[name="twitter:site"]').remove();
        $('meta[name="twitter:image"]').remove();
        $('meta[name="apple-mobile-web-app-title"]').remove();
        $('meta[name="application-name"]').remove();
    }

    render() {
        let {author, loading} = this.props;

        return (
            <div>
                {
                    loading ?
                        <p>Загрузка...</p>
                        :
                        author ?
                            [
                                this._getMetaTags(),
                                <div className="author-page">
                                    <AuthorBlock/>
                                    <CoursesBlock/>
                                </div>
                            ]
                            : null
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
        facebookAppID: state.app.facebookAppID,
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

export default connect(mapStateToProps, mapDispatchToProps)(AuthorPage);