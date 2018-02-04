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
                <div width="70" height="38" className='logo-mobile'>
                    <img src={'/assets/svg/logo-mob.svg'}/>
                </div>


        )
    }
}