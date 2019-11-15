import React from 'react'
import './cover.sass'
// import StartButton from "./start-button";
import {testSelector} from "ducks/test";
import {testResultSelector} from "ducks/test-result";
import {connect} from "react-redux";

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

        return <div className="test-page__cover js-test-content" style={_coverStyle}>
            <div className="test-result__info-wrapper">
                <div className="test-page__info">
                    <h1 className="info__title">
                        {`Верно ${result.CorrectCount} из ${result.TotalCount}`}
                    </h1>
                    <div className="info__message">
                        {`Вы не сдали тест «${test.Name}».`}
                    </div>
                </div>
            </div>
        </div>
    }
}

const mapStateToProps = (state) => {
    return {
        test: testSelector(state),
        result: testResultSelector(state)
    }
}

export default connect(mapStateToProps,)(Cover)