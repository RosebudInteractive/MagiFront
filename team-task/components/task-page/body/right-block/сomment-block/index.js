import React, {useEffect, useRef, useState} from "react"
import "./comment-block.sass"
import Pen from "tt-assets/svg/pen.svg";
import Apply from "tt-assets/svg/edit-apply.svg";
import Cancel from "tt-assets/svg/edit-cancel.svg";

type CommentBlockProps = {
    task: any,
    onSaveComment?: Function,
}

export default function CommentBlock(props: CommentBlockProps) {
    const {task,} = props

    return <div className="body__comment-block">
        {
            task.Log.map((item, index) => {
                return (item.Id === task.AlertId) ?
                    null
                    :
                    <Comment comment={item}
                             editable={index === 0 && task.isUserLastComment}
                             onSaveComment={props.onSaveComment}
                             key={index}/>})
        }
    </div>
}

type CommentProps = {
    comment: any,
    editable?: boolean,
    isAlert?: boolean,
    onSaveComment?: Function,
    // onDeleteComment?: Function,
}

export function Comment(props: CommentProps) {
    const {comment, isAlert, editable} = props,
        _time = (new Date(comment.TimeCr)).toLocaleDateString("ru-RU") + " " +
            (new Date(comment.TimeCr)).toLocaleTimeString("ru-RU", {hour: '2-digit', minute:'2-digit'})


    const [editMode, setEditMode] = useState(false)
    const [myValue, setMyValue] = useState(comment.Text)

    useEffect(() => {
        setMyValue(comment.Text)
    }, [comment.Text])

    const _needShowIcons = !(props.disabled || props.readOnly)

    const switchOnEditMode = () => {
        setEditMode(true)
    }

    const _textarea = useRef(null)

    useEffect(() => {
        window.addEventListener("resize", _recalcHeight)

        return () => {
            window.removeEventListener("resize", _recalcHeight)
        }
    }, [])

    useEffect(() => {
        _recalcHeight()
    }, [myValue])

    const _recalcHeight = () => {
        if (_textarea && _textarea.current) {
            _textarea.current.style.maxHeight = "1em"
            _textarea.current.style.height = (_textarea.current.scrollHeight) + "px";
            _textarea.current.style.maxHeight = "none"
        }
    }

    const change = (e) => {
        setMyValue(e.currentTarget.value)
    }

    const apply = () => {
        if (props.onSaveComment) {
            props.onSaveComment(comment.Id, myValue)
        }
        setEditMode(false)
    }

    const cancel = () => {
        setMyValue(comment.Text)
        setEditMode(false)
    }


    return <div className="comment-block__item" key={comment.Id}>

        <div className="_first-line">
            <div className="comment__user-name font-h8 _grey100">{comment.User.DisplayName}</div>
            {
                editable &&
                <React.Fragment>
                    {
                        !editMode && _needShowIcons &&
                        <div className="_button _pen" onClick={switchOnEditMode}>
                            <Pen/>
                        </div>
                    }
                    {
                        editMode && _needShowIcons &&
                        <React.Fragment>
                            <div className="_button _apply" onClick={apply}>
                                <Apply/>
                            </div>
                            <div className="_button _cancel" onClick={cancel}>
                                <Cancel/>
                            </div>
                        </React.Fragment>
                    }
                </React.Fragment>
            }
        </div>


        <div className="comment__date font-body-s _grey50">{_time}</div>
        <textarea className={"comment__text font-body-s _grey100" + (isAlert ? " _alert" : "")}
                  readOnly={!editMode}
                  ref={_textarea}
                  onChange={change}
                  value={myValue}/>
    </div>
}
