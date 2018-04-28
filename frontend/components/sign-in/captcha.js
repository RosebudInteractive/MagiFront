import React from 'react';
import Recaptcha from 'react-recaptcha';

export default class captcha extends React.Component {

    static propTypes = {};

    static defaultProps = {};

    render() {
        const verifyCallback = response => console.log(response);
        // const expiredCallback = () => {console.log('expiredCallback')};

        return (
            <Recaptcha
                sitekey="6LfobE8UAAAAAMR-Sj4I2ZYe_N74atRFN5jqhk6t"
                render="explicit"
                onloadCallback={verifyCallback}
                theme="dark"
            />
        );
    }
}