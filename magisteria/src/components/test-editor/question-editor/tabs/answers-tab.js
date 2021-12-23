import React from 'react'
import {Field, formValueSelector, touch,} from 'redux-form'
import PropTypes from "prop-types";
import Select from "../../../common/select-control";
import {connect} from "react-redux";
import {TextBox} from "../../../common/input-controls";
import RadioBox from "../../../common/radio-box-control";
import AnswerGrid from "../grids/answers";
import {bindActionCreators} from "redux";

const ANSWER_TYPES = [
        // {id: 1, value: 'Число'},
        {id: 2, value: 'Да/Нет'},
        {id: 3, value: '1 из многих'},
        {id: 4, value: 'N из многих'},
        // {id: 5, value: 'Текст'},
    ],
    RADIO_BOX_VALUES = [
        {value: 1, text: "Да"},
        {value: 0, text: "Нет"},
    ]

class AnswersTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _answers = window.$$('question-answers'),
                _width = $('.modal-editor__wrapper').width() - 2

            let _actionBarHeight = $('.promo-products .action-bar').height()

            let _height = $('.editor__main-area').height() - _actionBarHeight - 14

            if (_answers) {
                _answers.$setSize(_width, _height);
            }
        }
    }

    componentDidMount(){
        $(window).bind('resize', this._resizeHandler)

        this._resizeHandler();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            this._resizeHandler();
        }

        if (((+prevProps.answerType === 3) && (+this.props.answerType === 4)) ||
            ((+prevProps.answerType === 4) && (+this.props.answerType === 3))) {
            this.props.touch('QuestionEditor', 'Answers')
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }


    render() {
        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={Select} name="AnswType" label="Тип ответа" options={ANSWER_TYPES}/>
            {this._getCorrectAnswerField()}
        </div>
    }

    _getCorrectAnswerField() {
        const _disabled = false

        switch (+this.props.answerType) {
            case 1:
                return <Field component={TextBox} name="AnswInt" label="Значение правильного ответа" placeholder="Введите значение правильного ответа" disabled={_disabled}/>

            case 2:
                return <Field component={RadioBox} name="AnswBool" label="Правильный ответ" options={RADIO_BOX_VALUES}/>

            case 3:
                return <Field component={AnswerGrid} name="Answers" label="Варианты ответа" editMode={this.props.editMode}/>

            case 4:
                return <Field component={AnswerGrid} name="Answers" label="Варианты ответа" editMode={this.props.editMode}/>

            case 5:
                return <Field component={TextBox} name="AnswText" label="Текст правильного ответа" placeholder="Введите текст правильного ответа" disabled={_disabled}/>

            default:
                return null
        }
    }
}

const selector = formValueSelector('QuestionEditor')

function mapStateToProps(state) {
    return {
        answerType: selector(state, 'AnswType'),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({touch}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswersTab)