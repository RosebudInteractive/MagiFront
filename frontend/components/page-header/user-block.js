import React from 'react'

export default class UserBlock extends React.Component{
    render() {
        const userName = 'Борода Бородкин';

        return(
            <div className="user-block js-user-block">
                <div className="user-block__header js-tooltip-trigger">
                    <p className="user-block__name">{userName}</p>
                </div>
                {/*<ul class="user-tooltip">*/}
                    {/*<li>*/}
                        {/*<a href="#">История</a>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                        {/*<a href="#">Настройки</a>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                        {/*<a href="#" class="logout-btn">*/}
                            {/*<svg width="15" height="16">*/}
                                {/*<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logout"></use>*/}
                            {/*</svg>*/}
                            {/*<span>Выйти</span>*/}
                        {/*</a>*/}
                    {/*</li>*/}
                {/*</ul>*/}
            </div>
        )
    }
}