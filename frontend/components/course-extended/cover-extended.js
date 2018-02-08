import React from 'react';
// import Header from './header';
import Info from '../course/info';
// import CourseBody from './body';

export default class Cover extends React.Component {

    render() {
        return (
            <div className="course-module__info-block">
                <Header/>
            </div>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <div className="course-module__header">
                <Info authors={[]} categories={[]} showPhoto={true}/>
                <Body/>
            </div>
        )
    }
}

class Body extends React.Component {
    render() {
        return (
            <div className="course-module__body">
                <div className="course-module__image-block">
                    {/*<svg width="560" height="628" className="course-module__masked-image">*/}
                        {/*<symbol id="s-mask-circles">*/}
                            {/*<g stroke="gray" strokeWidth="12" fill="white">*/}
                                {/*<circle cx="33%" cy="20%" r="20%"/>*/}
                                {/*<circle cx="72%" cy="33%" r="25%"/>*/}
                            {/*</g>*/}
                        {/*</symbol>*/}
                        {/*<mask id="svgmask01">*/}
                            {/*<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#s-mask-circles"></use>*/}
                        {/*</mask>*/}
                        {/*<g mask="url(#svgmask01)">*/}
                            {/*<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="assets/images/bg-frame01.png" width="560" height="372"></image>*/}
                        {/*</g>*/}
                    {/*</svg>*/}
                </div>
            </div>
        )
    }
}