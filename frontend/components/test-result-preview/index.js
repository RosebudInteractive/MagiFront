import React from 'react'
import PropTypes from 'prop-types';


export default class ResultPreview extends React.Component {
    static propTypes = {
        test: PropTypes.object,
        result: PropTypes.object,
    }


    render() {
        const {test, result} = this.props,
            _cover = this._getCoverStyle(),
            LOGO = '<use xlink:href="#logo-mob"/>'

        return <div className="result-preview__cover" style={_cover}>
            <div className="result__logo">
                <svg width="70" height="38" dangerouslySetInnerHTML={{__html: LOGO}}/>
            </div>
            <div className="result-preview__info">
                <h1 className="result">
                    {`${result.CorrectCount} из ${result.TotalCount}`}
                </h1>
                <h1 className="title">
                    <div className="label">Тест по лекеции: </div>
                    <span className="name">{test.Name ? test.Name.trim() : ""}</span>
                </h1>
            </div>
        </div>
    }

    _getCoverStyle() {
        const {test,} = this.props,
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
            }

        return  {
                backgroundImage : "linear-gradient(rgba(47, 47, 47, 0.4) 0%, rgba(47, 47, 47, 0.4) 100%), url(" + '/data/' + _coverUrl + ")",
                backgroundPosition: `${_backgroundPosition.top} ${_backgroundPosition.left}`,
            }
    }
}