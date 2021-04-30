import React from "react"
import {Redirect} from "react-router-dom";
import {connect} from 'react-redux';
import $ from "jquery";
import MetaTags from "react-meta-tags";
import {getDomain, getPageUrl} from "tools/page-tools";
import {facebookAppIdSelector} from "ducks/app";

const DEFAULT_DESCRIPTION = "Иллюстрированные онлайн-курсы для всей семьи",
    DEFAULT_TITLE = "Каникулы здорового человека",
    DEFAULT_OG_IMAGE = "2019/12/fb-2019-2020_3.jpg",
    DEFAULT_TW_IMAGE = "2019/12/tw-2019-2020_3.jpg",
    ROOT_URL = "/",
    TITLE = {
        "sales2020": DEFAULT_TITLE,
        "sales2020-1": "Праздник, который останется с вами",
        "robinson2020": "Пока все дома",
        "giftcode": "Глубоких знаний хватит надолго",
        "technews062020": "Мы создаем не только контент",
        "ny-sale-2021": "С Новым 2021 годом!",
        "ios-app": "Магистерия на iOS",
        "android-app": "Магистерия на Android",
        "sales-march-2021": "Весна идет, весне дорогу!",
        "may-2021": "В ногу со знаниями",
    },
    DESCRIPTION = {
        "sales2020": DEFAULT_DESCRIPTION,
        "sales2020-1": DEFAULT_DESCRIPTION,
        "robinson2020": "Слушай, смотри, думай, читай!",
        "giftcode": "«послушает мудрый, и умножит познания»",
        "technews062020": "Технологические новости проекта",
        "ny-sale-2021": "Добрых вестей и крепкого здоровья в наступающем году!",
        "ios-app": "Курсы лекций у вас в кармане. Скачивайте, запускайте, слушайте и смотрите!",
        "android-app": "Курсы лекций у вас в кармане. Скачивайте, запускайте, слушайте и смотрите!",
        "sales-march-2021": "Блиц-распродажа с 5 по 8 марта.",
        "may-2021": "Большая майская распродажа на Магистерии",
    },
    OG_IMAGE = {
        "sales2020": DEFAULT_OG_IMAGE,
        "sales2020-1": "2020/01/fb-2020-sale.jpg",
        "robinson2020": "2020/03/fb-Eastman-Johnson_Reading-Boy_1863.jpg",
        "giftcode": "2020/04/fb-gift.jpg",
        "technews062020": "2020/06/fb-technews-06-2020.jpg",
        "ny-sale-2021": "2020/12/fb-2021-sale-3b5bb13d-f82f-4d2f-90a1-8d8e5d0c7c6d.jpg",
        "ios-app": "2021/01/fb-ios-app-jan-2021-1610868066035.png",
        "android-app": "2021/03/fb-android-app-ab317ac9-1044-4533-abd4-225119f9e634.jpg",
        "sales-march-2021": "2021/03/fb-2021-8March-sell-1614935266798.jpg",
        "may-2021": "2021/04/fb_sales_may21_01-1619772193921.jpg",
    },
    TW_IMAGE = {
        "sales2020": DEFAULT_TW_IMAGE,
        "sales2020-1": "2020/01/tw-2020-sale.jpg",
        "robinson2020": "2020/03/tw-Eastman-Johnson_Reading-Boy_1863.jpg",
        "giftcode": "2020/04/tw-gift.jpg",
        "technews062020": "2020/06/tw-technews-06-2020.jpg",
        "ny-sale-2021": "2020/12/tw-2021-sale-762c263c-17b1-4979-9192-a0a6f3de9886.jpg",
        "ios-app": "2021/01/tw-ios-app-jan-2021-1610868098951.png",
        "android-app": "2021/03/tw-android-app-91b93bcf-5abe-4950-9f27-d2ff5fd43d3f.jpg",
        "sales-march-2021": "2021/03/tw-2021-8March-sell-1614935413591.jpg",
        "smay-2021": "2021/04/tw_sales_may21_01-1619772224675.jpg",
    },
    URL = {
        "sales2020": ROOT_URL,
        "sales2020-1": ROOT_URL,
        "robinson2020": "/razdel/literature",
        "giftcode": ROOT_URL,
        "technews062020": ROOT_URL,
        "ny-sale-2021": ROOT_URL,
        "ios-app": "https://apps.apple.com/ru/app/%D0%BC%D0%B0%D0%B3%D0%B8%D1%81%D1%82%D0%B5%D1%80%D0%B8%D1%8F/id1543015350",
        "android-app": "https://play.google.com/store/apps/details?id=ru.magisteria.magisteria_app",
        "sales-march-2021": ROOT_URL,
        "may-2021": ROOT_URL,
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
                _url = this._getUrl() + (ownProps && ownProps.location ? ownProps.location.search + ownProps.location.hash : "")

            if (isLinkExternal(_url)) {
                window.location = _url
                return null
            } else {
                return  <Redirect to={_url}/>
            }
        } else {
            let _url = getPageUrl(),
                _domain = getDomain(),
                _imagePath = _domain + '/data/';

            this._removeRobotsMetaTags()

            return <MetaTags>
                <meta name="description" content={this._getDescr()}/>
                <link rel="canonical" href={_url}/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={this._getTitle()}/>
                <meta property="og:description" content={this._getDescr()}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={this.props.facebookAppID}/>
                <meta property="og:image" content={_imagePath + this._getOgImage()}/>
                <meta property="og:image:secure_url" content={_imagePath + this._getOgImage()}/>
                <meta property="og:image:width" content={1200}/>
                <meta property="og:image:height" content={640}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={this._getTitle()}/>
                <meta name="twitter:description" content={this._getDescr()}/>
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

    _getTitle() {
        let _code = this.props.ownProps.match.params.code,
            _title = TITLE[_code]

        return _title ? _title : DEFAULT_TITLE
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

    _getDescr() {
        let _code = this.props.ownProps.match.params.code,
            _descr = DESCRIPTION[_code]

        return _descr ? _descr : DEFAULT_TW_IMAGE
    }

    _getUrl() {
        let _code = this.props.ownProps.match.params.code,
            _url = URL[_code]

        return _url ? _url : ROOT_URL
    }
}

const isLinkExternal = (link) => {
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!link && pattern.test(link);
}

const MapStateToProps = (state, ownProps) => {
    return {
        facebookAppID: facebookAppIdSelector(state),
        ownProps: ownProps
    }
}

export default connect(MapStateToProps)(EmptyPromoPage)
