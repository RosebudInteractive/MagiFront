import React from "react";
import MetaTags from "react-meta-tags";
import $ from "jquery";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {notifyAnalyticsChangePage} from "ducks/app";

const TITLE = "Образовательный сайт с лекциями о живописи, музыке, философии, литературе, истории и многом другом. Отличная помощь студентам, продвинутым старшеклассникам и всем людям с культурными запросами. Зачерпни знания у источника!"

class ProjectPage extends React.Component {

    componentWillMount() {
        window.scrollTo(0, 0)
    }

    componentDidMount() {
        document.title = TITLE
        this.props.changePage(this.props.ownProps.location.pathname)
    }

    componentWillUnmount() {
        this._removeMetaTags();
    }

    render() {
        const _symbol = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#c"/>',
            _style = {paddingTop: '95px'}

        return <React.Fragment>
            {this._getMetaTags()}
                <main className="project-page" style={_style}>
                    <section className="project-info">
                        <div className="project-info__wrapper">
                            <h1 className="project-info__title _mobile">От редактора</h1>
                            <div className="project-info__inner">
                                <div className="project-info__col">
                                    <div className="project-info__image-block">
                                        <h1 className="project-info__title">От редактора</h1>
                                        <h2 className="project-info__name">Андрей Борейко</h2>
                                        <p className="project-info__position">Главный редактор</p>
                                        <div className="project-info__image">
                                            <img src="/data/2016/08/unnamed-2-768x768.jpg" width="479" height="459" alt=""/>
                                        </div>
                                    </div>
                                </div>
                                <div className="project-info__col">
                                    <div className="project-info__text-block">
                                        <p className="project-info__text">
                                            <span className="letter">
                                                <svg width="97" height="108" dangerouslySetInnerHTML={{__html: _symbol}}/>
                                            </span>
                                            <span className="project-info__text__first-paragraph">
                                                Стоит услышать живую, осмысленную речь знающего человека, как ум цепляется за нее,
                                                ищет и находит в ней точку опоры для собственной мысли и речи. Один видит в ней
                                                путеводную нить. Другому нужен повод для спора. Но предмет полемики – все то же
                                                изначально прозвучавшее слово.
                                            </span>
                                        </p>
                                        <p className="project-info__text">В гуманитарном знании, то есть знании людей о людях,
                                            «человеческий фактор» – не помеха, а фундамент. Когда мы вступаем в новую или
                                            подзабытую область, нам нужен проводник, наставник, по-латыни – <i>магистр</i>. Отсюда и
                                            название – Magisteria.</p>
                                        <p className="project-info__text">Конечно, в разных местах нужны разные проводники.
                                            В неуютных и печальных местах Данте сопровождает Виргилий. Через рай его ведет
                                            Беатриче. У каждого мастера своя область компетенции. Опытный наставник подскажет
                                            как не потерять время, что почитать, на что обратить внимание.</p>
                                        <p className="project-info__text">На этом сайте вы услышите учителей, чье слово
                                            отчетливо пробивается через шум информационной эпохи, дает новую перспективу,
                                            предлагает свежий взгляд на, казалось бы, привычные темы и сюжеты.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
        </React.Fragment>
    }

    _getMetaTags() {
        this._removeRobotsMetaTags()

        return <MetaTags>
            <meta name = "description"
                  content = {TITLE}/>
        </MetaTags>
    }

    _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }
}

const mapStateToProps = (state, ownProps) => {
    return {ownProps}
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({changePage: notifyAnalyticsChangePage}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage)