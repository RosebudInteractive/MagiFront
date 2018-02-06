import React from 'react';
// import SvgLogoFull from '../../assets/images/svg/logo.svg';
// import SvgLogo from '../../assets/images/svg/.svg';

export default class Logo extends React.Component {

    render() {
        const {isFull} = this.props;

        return (

            isFull ?
                <div width="130" height="31" className='logo'>
                    <img src={'/assets/svg/logo.svg'}/>
                </div>
                :
                <div className='logo-mobile'>
                    {/*<img src={'/assets/svg/logo-mob.svg'}/>*/}
                    <svg id="logo-mob" viewBox="0 0 70 38" width="100%" height="100%"><title>logo_black</title>
                        <desc>Created using Figma</desc>
                        <g transform="translate(0 2.81)">
                            <path id="logo-mob-a"
                                  d="M0 35.191h4.38V0H0v35.191zm42.843 0h4.38V0h-4.38v35.191zm8.76 0h4.383V0h-4.383v35.191zm-34.54 0h4.382L11.76 0H7.378l9.685 35.191zm6.917-8.799l2.167-7.594L20.752 0H16.37l7.609 26.392zM39.844 0h-4.38L25.78 35.191h4.38L39.843 0z"></path>
                        </g>
                    </svg>
                </div>
        )
    }
}