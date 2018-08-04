import React from "react";

export default class Message extends React.Component {
    render() {
        const _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>';

        return (
            <div className="favourites__message">
                <b>Тут пока пусто</b>
                <p>Вы можете отмечать курсы или лекции <i>символом закладки</i>;
                    <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _redFlag}}/>
                    {/*<br>и они всегда будут доступны из этого раздела.</br>*/}
                </p>
            </div>
        )
    }
}