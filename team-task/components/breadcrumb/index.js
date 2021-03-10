import React, {useState, useEffect} from "react"
import "./breadcrumb.sass"
import { Breadcrumb } from 'rsuite';
import {Link} from "react-router-dom";
import {useLocation} from "react-router-dom"

const PATHES = {
    processes: "Процессы",
    tasks: "Задачи",
    task: "Задача",
    notifications: "Уведомления",
    dictionaries: "Справочники"
}

const BreadcrumbLink = props => <Breadcrumb.Item componentClass={Link} {...props} />;

export default function BreadcrumbPane(props) {

    const location = useLocation()

    // useEffect(() => {}, [location])
        ,pathes = location.pathname.split("/")

    const breadcrumbs = []

    pathes.filter(item => !!item).reduce((acc, item) => {
        let _newValue = "/" + acc + item,
            _label = PATHES[item] ? PATHES[item] : item

        breadcrumbs.push(<BreadcrumbLink to={_newValue}>{_label}</BreadcrumbLink>)
        return _newValue
    }, "")

    return <nav className="breadcrumb-pane">
        <Breadcrumb separator={">"}>
            {breadcrumbs}
            {/*<BreadcrumbLink to={"/processes"}>Процессы</BreadcrumbLink>*/}
            {/*<BreadcrumbLink to={"/tasks"}>Задачи</BreadcrumbLink>*/}
        </Breadcrumb>
    </nav>
}


