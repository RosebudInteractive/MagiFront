import React from "react"
import {Redirect} from "react-router-dom";
import {connect} from 'react-redux';
import $ from "jquery";
import MetaTags from "react-meta-tags";
import {getDomain, getPageUrl} from "tools/page-tools";
import {facebookAppIdSelector} from "ducks/app";

const DESCRIPTION = "Описание страницы",
    TITLE = "Заголовок страницы",
    OG_IMAGE = "2019/06/Chrysanthemum-Description1-id-1.jpg",
    TW_IMAGE = "2019/06/id-8-Tulips-Tulips-desc-1559656921020.jpg"

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
            return <Redirect to={'/'}/>
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
                <meta property="og:image" content={_imagePath + OG_IMAGE}/>
                <meta property="og:image:secure_url" content={_imagePath + OG_IMAGE}/>
                <meta property="og:image:width" content={1200}/>
                <meta property="og:image:height" content={640}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={TITLE}/>
                <meta name="twitter:description" content={DESCRIPTION}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                <meta name="twitter:image" content={_imagePath + TW_IMAGE}/>
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
}

const MapStateToProps = (state) => {
    return {
        facebookAppID: facebookAppIdSelector(state),
    }
}

export default connect(MapStateToProps)(EmptyPromoPage)