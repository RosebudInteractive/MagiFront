import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import "./content-tooltip.sass"
import "./custom-scrollbar.css"

import $ from 'jquery'
import 'script-lib/jquery.mCustomScrollbar.concat.min.js';

export default function ContentTooltip(props) {
    const {id, playerController} = props

    const [contentArray, setContentArray] = useState(playerController.state.contentArray)
    const [currentContent, setCurrentContent] = useState(playerController.state.currentContent)
    const [paused, setPaused] = useState(playerController.state.paused)

    let _scrollMounted = false;

    useEffect(() => {
        playerController.subscribe(_onStateChanged)
        _mountCustomScroll()

        let _id = currentContent ? currentContent.id : 0

        if (_id) {
            let _selector = `#toc-${_id}`,
                _position = $(_selector).parent().position()

            _position.top -= 8
            $("#mcs_container").mCustomScrollbar("scrollTo", Object.values(_position), { scrollInertia : 0, timeout : 0 });
        }

        return () => {
            _unmountCustomScroll()
            playerController.unsubscribe(_onStateChanged)
        }
    }, [])

    // useEffect(() => {
    //     _unmountCustomScroll()
    //     _mountCustomScroll()
    // }, [contentArray.length])

    const _onStateChanged = (state) => {
        if (currentContent !== state.currentContent) setCurrentContent(state.currentContent)
        if (paused !== state.paused) setPaused(state.paused)
        setContentArray(state.contentArray)
    }

    const _mountCustomScroll = () => {
        if (_scrollMounted) return

        let _div = $('#contents' + props.id);
        if (_div.length && _div[0].childElementCount) {
            _div.mCustomScrollbar();
            _scrollMounted = true;
        }
    }

    const _unmountCustomScroll = () => {
        if (_scrollMounted) {
            let _div = $('#contents' + props.id);
            if (_div.length) {
                _div.mCustomScrollbar('destroy');
                _scrollMounted = false
            }
        }
    }

    const _getContent = () => {
        return contentArray.map((item, index) => {
            let _currContentId = currentContent ? currentContent.id : 0,
                _isActive = _currContentId === item.id;

            return <li className={_isActive ? 'active' : ''} key={index}
                       onClick={() => {
                           _goToContent(item.begin)
                       }}>
                <div className='contents-tooltip_item' id={`toc-${item.id}`}>{item.title}</div>
                {
                    _isActive ?
                        <div className={"equalizer" + (paused ? " paused" : "")}>
                            <div className='eq-1'/>
                            <div className='eq-2'/>
                            <div className='eq-3'/>
                            <div className='eq-4'/>
                            <div className='eq-5'/>
                        </div>
                        :
                        null
                }

            </li>
        })
    }

    const _goToContent = (begin) => {
        playerController.requestSetCurrentTime(begin)
    }


    return <div className={"contents-tooltip js-player-tooltip js-contents opened"}>
            <header className="contents-tooltip__header">
                <div className="contents-tooltip__title">Оглавление</div>
            </header>
            <ol className="contents-tooltip__body scrollable" id={'contents' + id}>
                {_getContent()}
            </ol>
        </div>
}

ContentTooltip.propTypes = {
    id: PropTypes.number,
    playerController: PropTypes.object
}