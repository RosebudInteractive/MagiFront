import React from "react"
import {Redirect} from "react-router-dom";
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import $ from "jquery";
import MetaTags from "react-meta-tags";
import {getDomain, getPageUrl} from "tools/page-tools";
import {facebookAppIdSelector} from "ducks/app";
import {getShareResult, shareResultSelector, loadingSelector, loadedSelector, notFoundSelector} from "ducks/test-share-result";
import NotFoundPage from "../not-found";


class TestResultSharePage extends React.Component{
    constructor(props) {
        super(props)

        this.state = {redirect : false}

        $(document).ready(()=>{
            this.setState({redirect: true})
        })
    }

    componentDidMount() {
        this.props.getShareResult(this.props.shareCode)
    }

    componentWillUnmount() {
        this._removeMetaTags();
    }

    render() {
        if (this.props.fetching || !this.props.resultLoaded) {return null}

        if (this.state.redirect && !window.prerenderEnable) {
            const {ownProps, notFound} = this.props,
                _url = this._getRedirectUrl() + (ownProps && ownProps.location ? ownProps.location.search + ownProps.location.hash : "")
            
            return notFound ? <NotFoundPage/> : <Redirect to={_url}/>
        } else {
            let _url = getPageUrl(),
                _domain = getDomain(),
                _imagePath = _domain + '/data/';

            const {shareInfo} = this.props

            this._removeRobotsMetaTags()

            return <MetaTags>
                <meta name="description" content={shareInfo.SnDescription}/>
                <link rel="canonical" href={_url}/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={shareInfo.SnName}/>
                <meta property="og:description" content={shareInfo.SnDescription}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={this.props.facebookAppID}/>
                {
                    shareInfo.Images && shareInfo.Images.og && shareInfo.Images.og.FileName
                        ?
                        [
                            <meta property="og:image" content={_imagePath + shareInfo.Images.og.FileName}/>,
                            <meta property="og:image:secure_url" content={_imagePath + shareInfo.Images.og.FileName}/>
                        ]
                        :
                        null
                }

                <meta property="og:image:width" content={1200}/>
                <meta property="og:image:height" content={640}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={shareInfo.SnName}/>
                <meta name="twitter:description" content={shareInfo.SnDescription}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                {
                    shareInfo.Images && shareInfo.Images.tw && shareInfo.Images.tw.FileName
                        ?
                        <meta name="twitter:image" content={_imagePath + shareInfo.Images.tw.FileName}/>
                        :
                        null
                }
                <meta name="twitter:creator" content="@MagisteriaRu"/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>
            </MetaTags>
        }
    }

    _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('link[rel="canonical"]').remove();
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
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _getRedirectUrl() {
        let {user, shareInfo,resultLoaded} = this.props,
            _testOwnCurrentUser = !!user && resultLoaded && (user.Id === shareInfo.UserId)

        return _testOwnCurrentUser ? `/test-instance/${shareInfo.TestInstanceId}` : `/test/${shareInfo.TestId}`
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        facebookAppID: facebookAppIdSelector(state),
        shareInfo: shareResultSelector(state),
        shareCode: ownProps.match.params.code,
        fetching: loadingSelector(state),
        resultLoaded: loadedSelector(state),
        notFound: notFoundSelector(state),
        user: state.user.user,
        ownProps: ownProps
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({getShareResult}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestResultSharePage)