import React from 'react'
import PropTypes from "prop-types";
import {connect} from "react-redux";
import ImportButton from "./import-buttom"
import {bindActionCreators} from 'redux';
import {Field} from "redux-form";
import {TextBox} from "../../../common/input-controls";
import Select from "../../../common/select-control";

const EPISODE_TYPES = [
        {id: 'L', value: 'Лекция'},
    ],
    EPISODE_STATE = [
        {id: 'D', value: 'Черновик'},
        {id: 'R', value: 'Готовый'},
        {id: 'A', value: 'Архив'}
    ]

class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
        isWorkshop: PropTypes.bool,
    }

    render() {

        // const {} = this.props;

        const _disabled = false;

        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <div className="main-tab__buttons-wrapper">
                <ImportButton/>
                <button className="adm__button bottom-controls__button" onClick={::this._openWorkshop}>Перейти в
                    монтажный стол
                </button>
                <Field component={TextBox} name="name" label="Название эпизода" placeholder="Введите название эпизода" disabled={_disabled}/>
                <Field component={TextBox} name="number" label="Номер эпизода" disabled={true}/>
                <Field component={Select} name="episodeType" label="Тип эпизода" placeholder="Выберите тип эпизода"
                       options={EPISODE_TYPES} disabled={_disabled}/>
                <Field component={Select} name="state" label="Состояние" placeholder="Выберите состояние"
                       options={EPISODE_STATE} disabled={_disabled}/>
            </div>
        </div>

    }

    _openWorkshop(e) {
        e.preventDefault();

        if (!this.props.isWorkshop) {
            this.props.history.push(window.location.pathname + '?workshop')
        }
    }

}

function mapStateToProps(state) {
    return {
        packageUploadProcess: state.singleEpisode.packageUploadProcess,
    }
}

function mapDispatchToProps(dispatch) {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MainTab)