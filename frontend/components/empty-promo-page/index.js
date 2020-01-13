import React from "react"
import {Redirect} from "react-router-dom";
import {connect} from 'react-redux';
import $ from "jquery";
import MetaTags from "react-meta-tags";
import {getDomain, getPageUrl} from "tools/page-tools";
import {facebookAppIdSelector} from "ducks/app";

const DESCRIPTION = "Иллюстрированные онлайн-курсы для всей семьи",
    TITLE = "Каникулы здорового человека",
    DEFAULT_OG_IMAGE = "2019/12/fb-2019-2020_3.jpg",
    DEFAULT_TW_IMAGE = "2019/12/tw-2019-2020_3.jpg",
    OG_IMAGE = {
        "sale2020": DEFAULT_OG_IMAGE,
        "sale2020-1": "2020/01/fb-2020-sale.jpg",
    },
    TW_IMAGE = {
        "sale2020": DEFAULT_TW_IMAGE,
        "sale2020-1": "2020/01/tw-2020-sale.jpg",
    }



class EmptyPromoPage extends React.Component{
    constructor(props) {
        super(props)

        this.state = {redirect : false}

        $(document).ready(()=>{
            this.setState({redirect: true})
        })

        $(body).addClass("result-preview")
    }

    componentWillUnmount() {
        this._removeMetaTags();
        $(body).removeClass("result-preview")
    }

    render() {
        if (this.state.redirect && !window.prerenderEnable) {
            const {ownProps} = this.props,
                _url = '/' + (ownProps && ownProps.location ? ownProps.location.search + ownProps.location.hash : "")
            
            return <Redirect to={_url}/>
        } else {
            let _url = getPageUrl(),
                _domain = getDomain(),
                _imagePath = _domain + '/data/';

            this._removeRobotsMetaTags()

            return <MetaTags>
                <meta name="description" content={DESCRIPTION}/>
                <link rel="canonical" href={_url}/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={TITLE}/>
                <meta property="og:description" content={DESCRIPTION}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={this.props.facebookAppID}/>
                <meta property="og:image" content={_imagePath + this._getOgImage()}/>
                <meta property="og:image:secure_url" content={_imagePath + this._getOgImage()}/>
                <meta property="og:image:width" content={1200}/>
                <meta property="og:image:height" content={640}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={TITLE}/>
                <meta name="twitter:description" content={DESCRIPTION}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                <meta name="twitter:image" content={_imagePath + this._getTwImage()}/>
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

    _getOgImage() {
        let _code = this.props.ownProps.match.params.code,
            _path = OG_IMAGE[_code]

        return _path ? _path : DEFAULT_OG_IMAGE
    }

    _getTwImage() {
        let _code = this.props.ownProps.match.params.code,
            _path = TW_IMAGE[_code]

        return _path ? _path : DEFAULT_TW_IMAGE
    }
}

const MapStateToProps = (state, ownProps) => {
    return {
        facebookAppID: facebookAppIdSelector(state),
        ownProps: ownProps
    }
}

export default connect(MapStateToProps)(EmptyPromoPage)