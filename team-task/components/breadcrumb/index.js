import React, {useMemo} from "react"
import "./breadcrumb.sass"
import {Breadcrumb} from 'rsuite';
import {Link} from "react-router-dom";
import {useLocation} from "react-router-dom"

const PATHES = {
    processes: "Процессы",
    tasks: "Задачи",
    task: "Задача",
    notifications: "Уведомления",
    dictionaries: "Справочники"
}

const BreadcrumbLink = props => <Breadcrumb.Item componentClass={Link} {...props} key={props.index}/>;

export default function BreadcrumbPane(props) {

    const location = useLocation(),
        paths = location.pathname.split("/")

    const parsePath = () => {
        let _result = []

        paths
            .filter(item => !!item)
            .reduce((acc, item, index) => {
                let _newValue = "/" + acc + item,
                    _label = PATHES[item] ? PATHES[item] : item

                _result.push(<BreadcrumbLink to={_newValue} index={index} key={index}>{_label}</BreadcrumbLink>)
                return _newValue
            }, "")

        return _result
    }

    const breadcrumbs = useMemo(() => parsePath(), [location])


    return <nav className="breadcrumb-pane">
        <Breadcrumb separator={">"}>
            {breadcrumbs}
        </Breadcrumb>
    </nav>
}


