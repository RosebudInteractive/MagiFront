import React, {useState, useEffect} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import ProcessesIco from "tt-assets/svg/processes.svg"
import TasksIco from "tt-assets/svg/tasks.svg"
import NotificationsIco from "tt-assets/svg/notifications.svg"
import DictionariesIco from "tt-assets/svg/dictionaries.svg"
import ElementIco from "tt-assets/svg/element-arrow.svg"
import "./side-bar-menu.sass"
import {NavLink} from "react-router-dom";

import Logo from "tt-assets/svg/logo.svg"

function SideBarMenu(props) {

    return <nav className="tt-main-area__side-bar-menu">
        <div className="side-bar-menu__logo">
            <Logo/>
        </div>
        <MenuLink Icon={ProcessesIco} url={"/processes"} title={"Процессы"}/>
        <MenuLink Icon={TasksIco} url={"/tasks"} title={"Задачи"}/>
        <MenuLink Icon={NotificationsIco} url={"/notifications"} title={"Уведомления"}/>
        <MenuList Icon={DictionariesIco} title={"Справочники"}>
            <MenuLink Icon={ElementIco} url={"/dictionaries/1"} title={"Элемент 1"}/>
            <MenuLink Icon={ElementIco} url={"/dictionaries/2"} title={"Элемент 2"}/>
            <MenuLink Icon={ElementIco} url={"/dictionaries/3"} title={"Элемент 3"}/>
        </MenuList>
    </nav>
}

type MenuLinkProps = {
    Icon: any,
    url: string,
    title: string,
};

function MenuLink(props: MenuLinkProps) {
    const {Icon, url, title,} = props

    return <NavLink to={url} className={"side-bar-menu__item title-font"} activeClassName={"_active"}>
        <Icon/>
        <div className="side-bar-menu__item-title">{title}</div>
    </NavLink>
}

type MenuListProps = {
    Icon: any,
    title: string,
};

function MenuList(props: MenuListProps) {
    const {Icon, title,} = props

    const [expanded, setExpanded] = useState(false)

    const _onClick = () => { setExpanded(!expanded) }

    return <div className="side-bar-menu__list">
        <div className={"side-bar-menu__item title-font"} onClick={_onClick}>
            <Icon/>
            <div className="side-bar-menu__item-title">{title}</div>
        </div>
        <div className={"side-bar-menu__elements" + (expanded ? " _expanded" : "")}>
            {props.children}
        </div>
    </div>
}

const mapState2Props = (state) => {
    return {}
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SideBarMenu)
