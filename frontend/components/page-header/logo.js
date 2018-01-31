import React from 'react';
import SvgLogoFull from '../../assets/images/svg/logo.svg';
import SvgLogo from '../../assets/images/svg/logo-mob.svg';

export default class Logo extends React.Component {

    render() {
        const {isFull} = this.props;

        return (

            isFull ?
                <div width="130" height="31" className='logo'>
                    <img src={SvgLogoFull}/>
                </div>
                :
                <div width="70" height="38" className='logo-mobile'>
                    <img src={SvgLogo}/>
                </div>


        )
    }
}