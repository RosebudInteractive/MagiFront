import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import MetaTags from 'react-meta-tags';

import {authorSelector, loadingSelector, notFoundSelector, getAuthor} from 'ducks/author'
import {facebookAppIdSelector, setCurrentPage, clearCurrentPage} from 'ducks/app'
import AuthorBlock from '../components/author/author-block';
import CoursesBlock from '../components/author/courses-and-lessons';
import NotFoundPage from '../components/not-found'

import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from "../actions/lesson-info-storage-actions";
import * as userActions from "../actions/user-actions";

import {pages, getDomain, getPageUrl, getAuthorPortraitPath, ImageSize,} from '../tools/page-tools';
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

    componentDidMount() {
        this.props.setCurrentPage(this);
    }

    componentDidUpdate() {
        if (this.props.author) {
            document.title = 'Автор : ' + this.props.author.FirstName + ' ' + this.props.author.LastName;
        }
    }

    componentWillUnmount() {
        this._removeMetaTags();
        this.props.clearCurrentPage()
    }

    reload() {
        this.props.storageActions.refreshState();
        this.props.getAuthor(this.props.authorUrl);
    }

    _getMetaTags() {
        let {author, facebookAppID} = this.props,
            _url = getPageUrl(),
            _domain = getDomain(),
            _title = author ? (author.FirstName + ' ' + author.LastName + ' - Магистерия') : '',
            _portrait = getAuthorPortraitPath(author, ImageSize.small);

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
                <meta property="og:image" content={_domain + _portrait}/>
                <meta property="og:image:secure_url" content={_domain + _portrait}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:description" content={author.Description}/>
                <meta name="twitter:title" content={_title}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                <meta name="twitter:image" content={_domain + _portrait}/>
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

    _getPage() {
        let {author, notFound} = this.props;

        return notFound ?
            <NotFoundPage/>
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

    render() {
        return this.props.loading ?
            <p>Загрузка...</p>
            :
            this._getPage()
    }
}

function mapStateToProps(state, ownProps) {
    return {
        author: authorSelector(state),
        loading: loadingSelector(state),
        notFound: notFoundSelector(state),
        authorUrl: ownProps.match.params.url,
        facebookAppID: facebookAppIdSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        getAuthor: bindActionCreators(getAuthor, dispatch),
        setCurrentPage: bindActionCreators(setCurrentPage, dispatch),
        clearCurrentPage: bindActionCreators(clearCurrentPage, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorPage);