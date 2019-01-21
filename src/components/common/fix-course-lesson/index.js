import React from 'react'
import {reduxForm, Field} from 'redux-form'

const validate = values => {
    const errors = {}

    // if (!values.login) {
    //     errors.login = 'Required'
    // } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.login)) {
    //     errors.login = 'Invalid email address'
    // }
    // if (!values.password) {
    //     errors.password = 'Required'
    // }
    return errors
}

class FixingBlock extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
            showTextBlock: null
        }
    }

    render() {

    }
}

export default reduxForm({
    form: 'FixingBlock',
    validate
})(FixingBlock);

