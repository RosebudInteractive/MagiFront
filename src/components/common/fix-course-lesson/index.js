import React from 'react'
import {reduxForm, Field} from 'redux-form'
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

    constructor(props) {
        super(props)
        this.state = {
            showDescription: this.props.fixed
        }
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

        if (prevProps.fixed !== this.props.fixed) {
            this.setState({showDescription: this.props.fixed})
        }
    }

    render() {
        return <div className="form-wrapper non-webix-form">
            <form className="fix-control-form">
                <Field component={CheckBox} name="active" label={this.props.label}
                       onChange={::this._changeActive} checked={this.props.fixed} disabled={!this.props.canFix}/>
                <Field name="description" label='Описание' component={TextArea} hidden={!this.state.showDescription}
                       onBlur={::this.props.validate} defaultValue={this.props.descr}/>
            </form>
        </div>
    }

    _changeActive(event) {
        if (event.target) {
            this.setState({showDescription: event.target.checked})
        }

    }
}

export default reduxForm({
    form: 'FixingBlock',
    validate,
})(FixingBlock);

