import React from 'react';
import {reduxForm, Field} from 'redux-form';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {subscribe, loadingSelector} from "../../ducks/message";

const validate = values => {
    const errors = {}

    if (!values.email) {
        errors.email = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address'
    }
    return errors
}

let SubscribeForm = class SubscribeForm extends React.Component {

    constructor(props) {
        super(props)
    }

    _handleSubmit(values) {
        this.props.subscribe({
            Email: values.email,
            Name: " ",
            LastName: " ",
        })
    }

    componentDidMount() {
        this.props.reset();
    }

    render() {
        const _next = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#next"/>';

        let {invalid, loading,} = this.props,
            _disabledBtn = invalid || loading;

        return (
            <div className="subscribe-block">
                <h4 className="subscribe-block__label">Подписка</h4>
                <p className="subscribe-block__descr">Оставьте ваш e-mail и мы оповестим вас когда новые лекции появятся
                    на сайте</p>
                <form className="form subscribe-form" onSubmit={this.props.handleSubmit(::this._handleSubmit)}>
                    <div className="subscribe-form__field-wrapper">
                        <Field name="email" component={EmailField}/>
                        <button className={"subscribe-form__submit" + (_disabledBtn ? ' disabled' : '')} type='submit'>
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _next}}/>
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

class EmailField extends React.Component {
    render() {
        const {input} = this.props;

        return <input {...input} type="email" id="email-subscribe" className="subscribe-form__field" placeholder="E-mail"/>
    }
}

SubscribeForm = reduxForm({
    form: 'subscribe-form',
    validate
})(SubscribeForm);

function mapStateToProps(state) {
    return {
        loading: loadingSelector(state),
    }
}


function mapDispatchToProps(dispatch) {
    return {
        subscribe: bindActionCreators(subscribe, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscribeForm);