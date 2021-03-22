import React, {useEffect, useRef, useMemo} from "react"
import "./comment-block.sass"

type TaskBodyProps = {
    task: any,
}

export default function CommentBlock(props: TaskBodyProps) {
    const {task,} = props

    return <div className="body__comment-block">
        {
            task.Log.map((item, index) => {return <Comment comment={item} key={index}/>})
        }
    </div>
}

type CommentProps = {
    comment: any,
}

function Comment(props: CommentProps) {
    const {comment} = props,
        _time = (new Date(comment.TimeCr)).toLocaleDateString("ru-RU")

    return <div className="comment-block__item" key={comment.Id}>
        <div className="comment__user-name font-h8 _grey100">{comment.User.DisplayName}</div>
        <div className="comment__date font-body-s _grey50">{_time}</div>
        <div className="comment__text font-body-s _grey100">
            <span className="_title _grey50">Добавил комментарий: </span>
            {comment.Text}
        </div>
    </div>
}
