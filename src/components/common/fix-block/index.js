import React, {Fragment} from 'react'
import {connect} from "react-redux";
import {reduxForm, Field, formValueSelector,} from 'redux-form'
import {CheckBox} from '../input-controls'
import TextArea from '../text-area'
import PropTypes from 'prop-types'
import '../form.sass'

const validate = values => {
    const errors = {}

    if (values.active && !values.description) {
        errors.description = 'Значение не может быть пустым'
    }

    return errors
}

class FixingBlock extends React.Component {

    static propTypes = {
        fixed: PropTypes.bool,
        label: PropTypes.string,
        descr: PropTypes.string,
        canFix: PropTypes.bool,
    }

    static defaultProps = {
        canFix: true,
    }

    componentDidMount() {
        this.props.initialize({active: this.props.fixed, description: this.props.descr});
    }

    componentWillUnmount() {
        this.props.reset();
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.fixed !== this.props.fixed) || (prevProps.descr !== this.props.descr)){
            this.props.destroy();
            this.props.initialize({active: this.props.fixed, description: this.props.descr});
        }
    }

    render() {
        return <Fragment>
                <Field component={CheckBox} name="fixed" label={this.props.label}
                       checked={this.props.fixed} disabled={!this.props.canFix}/>
                <Field name="fixedDescription" label='Описание' component={TextArea} hidden={!this.props.activeFix}
                       onBlur={::this.props.validate} defaultValue={this.props.descr}/>
        </Fragment>

    }
}

let FixingBlockWrapper = reduxForm({
    form: 'FixingBlock',
    validate,
})(FixingBlock);

const selector = formValueSelector('FixingBlock')

FixingBlockWrapper = connect(state => {
    const activeFix = selector(state, 'active')
    const descriptionFix = selector(state, 'description')

    return {
        activeFix,
        descriptionFix,
    }
})(FixingBlockWrapper)

export default FixingBlockWrapper

