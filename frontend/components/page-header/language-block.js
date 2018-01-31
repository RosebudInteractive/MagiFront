import React from 'react'

export default class LanguageBlock extends React.Component {
    render() {
        return (
            <div className="language-block">
                <button type="button" className="language-indicator "><span>Рус</span></button>
                {/*<ul class="language-tooltip js-language-picker">*/}
                    {/*<li class="selected">*/}
                        {/*<a href="#" data-lang="Рус">Русский</a>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                        {/*<a href="#" data-lang="En">English</a>*/}
                    {/*</li>*/}
                    {/*<li>*/}
                        {/*<a href="#" data-lang="Es">Espaniol</a>*/}
                    {/*</li>*/}
                {/*</ul>*/}
            </div>
        )
    }
}

