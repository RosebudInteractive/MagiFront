import React from 'react';
// import Header from './header';
import Info from '../course/info';
import * as svg from '../../tools/svg-paths';

export default class Content extends React.Component {

    render() {
        return (
            <div className="course-module__info-block">
                <SocialBlock/>
                <Description/>
            </div>
        );
    }
}

class SocialBlock extends React.Component {
    render() {
        return (
            <div className="social-block social-block--dark">
                <SocialButton href={'tw'} icoWidth={27} icoHeght={22}/>
                <SocialButton href={'fb'} icoWidth={24} icoHeght={24} count={64}/>
                <SocialButton href={'vk'} icoWidth={26} icoHeght={15} count={91}/>
                <SocialButton href={'ok'} icoWidth={14} icoHeght={24} count={4}/>
            </div>
        )

    }
}

class SocialButton extends React.Component {
    render() {
        let {href, count, icoWidth, icoHeight} = this.props;

        return (
            <a className="social-btn">
                <div className="social-btn__icon">
                    <svg width={icoWidth} height={icoHeight}>
                        {svg.social[href]}
                    </svg>
                </div>
                <span className="social-btn__actions">{count ? count : null}</span>
            </a>
        )
    }
}

class Description extends React.Component {
    render() {
        return (
            <div className="course-module__course-descr">
                <p>Курс Олега Лекманова <span className="cur">«Довоенная советская литература»</span> освещает творчество и жизненные ситуации писателей от революции 1917 года до начала Великой Отечественной войны, главным образом, в 1920-е и 30-е годы. Речь пойдет о писателях, которые были в разных отношениях с советской властью: Мандельштам <a href="#">[5]</a> и Маяковский <a href="#">[6]</a> , Набоков <a href="#">[19]</a> и Шолохов <a href="#">[9]</a>, Булгаков <a href="#">[15]</a><a href="#">[16]</a> и Платонов <a href="#">[10]</a> , Багрицкий <a href="#">[12]</a> и Цветаева <a href="#">[8]</a>. Одни были обласканы властью, другие затравлены, уничтожены морально и физически. Но все они продолжали заниматься литературным творчеством в этих новых, зачастую крайне тяжелых для художника исторических обстоятельствах, когда правящий политический режим пытался получить полный контроль не только над жизнью, но и над мыслями людей. Без анализа и понимания их произведений невозможно понять что же произошло с нашей страной в прошедшем столетии.</p>
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