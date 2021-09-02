import React, {useMemo, useRef,} from "react"
import './action-menu.sass'

type Position = {
    left: number,
    top: number
}

type Props = {
    isFinal: boolean,
    isAutomatic: boolean,
    position: Position,
    onEditLinks: Function,
    onEdit: Function,
    onDelete: Function,
    onFinalClick: Function,
    onAutoClick: Function,
}

export default function ActionMenu(props: Props) {
    const { isFinal, isAutomatic, position, onEdit, onEditLinks, onDelete, onFinalClick, onAutoClick } = props;

    return <div className={'task__action-menu'} style={position}>
        <div className='action-menu__item' onClick={onEdit}>Редактировать</div>
        <div className='action-menu__item' onClick={onEditLinks}>Указать связи</div>
        <div className='action-menu__item' onClick={onFinalClick}>{isFinal ? 'Убрать признак конечной' : 'Сделать конечной'}</div>
        <div className='action-menu__item' onClick={onAutoClick}>{isAutomatic ? 'Убрать признак автоматической' : 'Сделать автоматической'}</div>
        <div className='action-menu__item' onClick={onDelete}>Удалить</div>
    </div>
}
