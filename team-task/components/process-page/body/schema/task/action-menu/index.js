import React, {useMemo, useRef,} from "react"
import './action-menu.sass'

type Position = {
    left: number,
    top: number
}

type Props = {
    node: any,
    position: Position,
    onEditLinks: Function,
    onEdit: Function,
    onDelete: Function,
    onFinalClick: Function,
    onAutoClick: Function,
}

export default function ActionMenu(props: Props) {
    const { node, position, onEdit, onEditLinks, onDelete, onFinalClick, onAutoClick } = props;

    return <div className={'task__action-menu'} style={position}>
        { !node.disabled && <div className='action-menu__item' onClick={onEdit}>Редактировать</div> }
        { !node.disabled && <div className='action-menu__item' onClick={onEditLinks}>Указать связи</div> }
        {
            !node.disabled && !node.hasOutlines && !node.isAutomatic &&
            <div className='action-menu__item' onClick={onFinalClick}>{node.isFinal ? 'Убрать признак конечной' : 'Сделать конечной'}</div>
        }
        {
            !node.disabled && node.isFinal && !node.executorName &&
            <div className='action-menu__item' onClick={onAutoClick}>{node.isAutomatic ? 'Убрать признак автоматической' : 'Сделать автоматической'}</div>
        }
        <div className='action-menu__item' onClick={onDelete}>Удалить</div>
    </div>
}
