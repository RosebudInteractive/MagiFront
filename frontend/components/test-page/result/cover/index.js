import React from 'react'
import {bindActionCreators} from 'redux';
import './cover.sass'
import {testSelector} from "ducks/test";
import {testResultSelector} from "ducks/test-result";
import {connect} from "react-redux";
import {SocialBlock} from "../../social-block";
import {createNewTestInstance} from "ducks/test-instance";

const RELOAD = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>'

class Cover extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {test, result} = this.props,
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

        return <div className="test-result__cover js-test-content" style={_coverStyle}>
            <div className="margin-block flex-column-block">
                <div className="test-result__info">
                        <h1 className="title">
                            {`Верно ${result.CorrectCount} из ${result.TotalCount}`}
                        </h1>
                        <div className="message">
                            {`Вы не сдали тест «${test.Name}».`}
                        </div>
                </div>
                <div className="next-lesson__buttons-block">
                    <div className="reinit-button" onClick={::this._createInstance}>
                        <span>
                            <svg width="15" height="15" dangerouslySetInnerHTML={{__html: RELOAD}}/>
                        </span>
                        Пройти заново
                    </div>
                    <div className="button btn--brown next-lesson-button">
                        Следующая лекция
                    </div>
                </div>

                <div className="social-block__title">Поделится результатом с друзьями</div>
                <div className="social-block__wrapper">
                    <SocialBlock beforeOnClick={::this._beforeOnClick}/>
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
            socialBlock.setUrl("https://magisteria.ru/old-testament-iconography/jacob", button)
            reject()
        })
    }
}

const mapStateToProps = (state) => {
    return {
        test: testSelector(state),
        result: testResultSelector(state)
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({createNewTestInstance}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Cover)