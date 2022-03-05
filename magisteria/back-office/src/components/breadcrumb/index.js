import React, {useMemo} from "react"
import "./breadcrumb.sass"
import {Breadcrumb} from 'rsuite';
import {Link, useLocation} from "react-router-dom";
import NON_LINKED_ROUTES from "../../constants/nonLinkedRoutes";

const PATHES = {
    processes: "Процессы",
    tasks: "Задачи",
    task: "Задача",
    notifications: "Уведомления",
    dictionaries: "Справочники",
    components: "Компоненты",
    users: "Пользователи",
    timelines: "Таймлайны",
    rights: 'Роли'
};

const BreadcrumbLink = props => <Breadcrumb.Item {...props} key={props.index}/>;

export default function BreadcrumbPane(props) {

    const location = useLocation(),
        paths = location.pathname.split("/");

    const parsePath = () => {
        let _result = [];
        let keyVal = 0;

        paths
            .filter(item => !!item)
            .reduce((acc, item, index) => {
                keyVal += 1;
                let _newValue = acc + "/" + item,
                    _label = PATHES[item] ? PATHES[item] : item;

                if (NON_LINKED_ROUTES[item]) {
                    _result.push(<BreadcrumbLink index={keyVal} key={keyVal}>{_label}</BreadcrumbLink>)
                } else {
                    _result.push(<BreadcrumbLink componentClass={Link} to={_newValue} index={keyVal}
                                                 key={keyVal}>{_label}</BreadcrumbLink>)
                }
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


