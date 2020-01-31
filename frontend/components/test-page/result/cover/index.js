import React from 'react'
import {bindActionCreators} from 'redux';
import './cover.sass'
import {testSelector} from "ducks/test";
import {connect} from "react-redux";
import {SocialBlock} from "../../social-block";
import {
    testInstanceSelector,
    shareUrlSelector,
    urlCreatedSelector,
    createNewTestInstance,
    getShareLink,
    setShareUrl,
} from "ducks/test-instance";
import {getDomain} from "tools/page-tools";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";

const RELOAD = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>'

class Cover extends React.Component {

    static propTypes = {
        nextLessonUrl: PropTypes.object,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {test, result, urlCreated, shareUrl, nextLessonUrl} = this.props,
            _coverUrl = test.Cover

        if (typeof test.CoverMeta === "string") {
            test.CoverMeta = JSON.parse(test.CoverMeta)
        }

        const _backgroundPosition = test.CoverMeta && test.CoverMeta.backgroundPosition ?
                {
                    top: test.CoverMeta.backgroundPosition.percent.top * 100 + "%",
                    left: test.CoverMeta.backgroundPosition.percent.left * 100 + "%",
                }
                :
                {
                    top: "top",
                    left: "center"
                },
            _coverStyle = {
                backgroundImage : "linear-gradient(rgba(47, 47, 47, 0.4) 0%, rgba(47, 47, 47, 0.4) 100%), url(" + '/data/' + _coverUrl + ")",
                backgroundPosition: `${_backgroundPosition.top} ${_backgroundPosition.left}`,
            }

        const _percent = Math.round((result.CorrectCount / result.TotalCount) * 100)

        return <div className="test-result__cover js-test-content" style={_coverStyle}>
            <div className="margin-block flex-column-block">
                <div className="test-result__info">
                        <h1 className="title">
                            {`Верно ${result.CorrectCount} из ${result.TotalCount}`}
                        </h1>
                        <div className="message">
                            {`Вы ответили правильно на ${_percent}% вопросов теста «${test.Name}»`}
                        </div>
                </div>
                <div className="next-lesson__buttons-block">
                    <div className="reinit-button" onClick={::this._createInstance}>
                        <span>
                            <svg width="15" height="15" dangerouslySetInnerHTML={{__html: RELOAD}}/>
                        </span>
                        Пройти заново
                    </div>
                    {
                        nextLessonUrl &&
                        <Link to={nextLessonUrl}>
                            <div className="button btn--brown next-lesson-button">
                                Следующая лекция
                            </div>
                        </Link>
                    }
                </div>

                <div className="social-block__title">Поделиться результатом с друзьями</div>
                <div className="social-block__wrapper">
                    <SocialBlock beforeOnClick={::this._beforeOnClick} shareUrl={urlCreated ? shareUrl : null} urlCreated={urlCreated}/>
                    <div className="reinit-button" onClick={::this._createInstance}>
                        <span>
                            <svg width="15" height="15" dangerouslySetInnerHTML={{__html: RELOAD}}/>
                        </span>
                        Пройти заново
                    </div>
                </div>
            </div>
        </div>
    }

    _createInstance() {
        this.props.createNewTestInstance(this.props.test.URL)
    }

    _beforeOnClick(socialBlock, button) {
        return new Promise((resolve, reject) => {
            getShareLink(this.props.result.Id)
                .then((data) => {
                    socialBlock.doBeforeSetUrl(button)
                    this.props.setShareUrl(`${getDomain()}/test-result/${data.Id}`)
                    // reject()
                })
                .catch((e) => {
                    console.error(e)
                })
        })
    }
}

const mapStateToProps = (state) => {
    return {
        test: testSelector(state),
        result: testInstanceSelector(state),
        shareUrl: shareUrlSelector(state),
        urlCreated: urlCreatedSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({createNewTestInstance, setShareUrl}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Cover)