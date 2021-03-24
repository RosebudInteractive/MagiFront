import React, {useEffect, useMemo, useRef, useState} from "react"
import LineTo, {SteppedLineTo, Line} from 'react-lineto'
import "./schema.sass"
// import LeaderLine from "leader-line"

type SchemaProps = {
    Lessons: Array,
    States: Array,
    Users: Array,
    onAddTask: Function,
    tree: any,
}

export default function Schema(props: SchemaProps) {

    const {tree} = props

    const [active, setActive] = useState(0)

    const _onAdd = (e) => {
        if (props.onAddTask) {
            props.onAddTask(e)
        }
    }

    const style = useMemo(() => {
        if (tree) {
            return {
                "display": "grid",
                gridTemplateColumns: `repeat(${tree.colCount}, 1fr)`,
                gridTemplateRows: `repeat(${tree.rowCount}, 1fr)`
            }
        } else {
            return {
                "display": "block",
            }
        }
    }, [tree])

    const getCells = () => {
        if (tree) {
            return Object.values(tree.nodes).map((item, index) => {
                const style = {
                    width: "100%",
                    height: "100%",
                    // backgroundColor: "#aabbcc",
                    gridColumnStart: item.weight + 1,
                    gridRowStart: item.rowNumber + 1,
                }

                return <div className="process-schema__cell" style={style}>
                    <div className={"js-task_" + item.id + " process-task" + (active === item.id ? " _active" : "")}
                         id={"js-task_" + item.id} key={index}
                         onClick={() => {
                             setActive(item.id)
                         }}>
                        {item.name}
                    </div>
                </div>

            })
        } else {
            return null
        }
    }

    const lines = useMemo(() => {
        if (tree) {
            return tree.lines.map((item) => {
                return <SteppedLineTo from={"js-task_" + item.from} to={"js-task_" + item.to} delay={true}/>
            })
        } else {
            return null
        }
    }, [tree])


    const _lines = useRef([])

    useEffect(() => {

        if (tree) {
            setTimeout(() => {
                    tree.lines.forEach((item) => {
                        const startElement = document.getElementById("js-task_" + item.from),
                            endElement = document.getElementById("js-task_" + item.to);

                        // const _start = LeaderLine.pointAnchor(startElement, {x: "100%", y: "50%"}),
                        //     _end = LeaderLine.pointAnchor(endElement, {x: 0, y: "50%"})

                        const _line = new LeaderLine(startElement, endElement, {
                            color: (item.from === active) ? "#C8684C" :
                                (item.to === active) ? "#D1941A" : "#9696A0",
                            size: 2,
                            className: "ttt",
                            class: "eee",
                            _id: "yyy" + item.id,
                            startSocket: 'right',
                            endSocket: 'left',
                            startSocketGravity: 62,
                            endSocketGravity: 62,
                        })

                        console.log(_line._id)
                        const _path = $(`#leader-line-${_line._id}-line-path`)
                        if (_path && _path.parent() && _path.parent()) {
                            if ((item.from === active) || (item.to === active)) {
                                _path.parent().parent().addClass("_active")
                            }
                        }

                        _lines.current.push(_line)
                    })
                },
                300
            )
        }

        return () => {
            _lines.current.forEach((item) => {
                item.remove()
            })

            _lines.current = []
        }
    }, [tree, active])


    return <div className="process-body__schema">
        <h6 className="process-schema__title">Схема процесса</h6>
        <div className="process-schema__canvas" style={style}>
            {getCells()}
            {/*{lines}*/}
        </div>
        <button className="process-schema__add-task-button orange-button small-button" onClick={_onAdd}>Добавить
            задачу
        </button>
    </div>
}
