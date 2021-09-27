import React, {useState,} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import ProcessesIco from "tt-assets/svg/processes.svg"
import TasksIco from "tt-assets/svg/tasks.svg"
import NotificationsIco from "tt-assets/svg/notifications.svg"
import DictionariesIco from "tt-assets/svg/dictionaries.svg"
import TimelinesIco from "tt-assets/svg/timelines.svg"
import ElementIco from "tt-assets/svg/element-arrow.svg"
import "./side-bar-menu.sass"
import {NavLink} from "react-router-dom";

import Logo from "tt-assets/svg/logo.svg"
import {hasAdminRights, hasPmaRights, hasSupervisorRights} from "tt-ducks/auth";
import {sideBarMenuVisible} from "tt-ducks/app";
import {newNotifsCountSelector, notificationsSelector, unreadCountSelector} from "tt-ducks/notifications";

function SideBarMenu(props) {

    const {hasAdminRights, hasSupervisorRights, sideBarMenuVisible, unreadNotificationsCount, newNotifsCount, hasPmaRights} = props

    return <nav className={"tt-main-area__side-bar-menu" + (sideBarMenuVisible ? "" : " _hidden")}>
        <div className="side-bar-menu__logo">
            <Logo/>
        </div>
        {hasSupervisorRights && <MenuLink Icon={ProcessesIco} url={"/processes"} title={"Процессы"}/>}
        <MenuLink Icon={TasksIco} url={"/tasks"} title={"Задачи"}/>
        <MenuLink Icon={NotificationsIco} url={"/notifications"} title={"Уведомления"}
                  notifsCount={unreadNotificationsCount && unreadNotificationsCount > 0 ? unreadNotificationsCount : newNotifsCount}/>
        {
            hasAdminRights &&
            <MenuList Icon={DictionariesIco} title={"Справочники"}>
                <MenuLink Icon={ElementIco} nested={true} url={"/dictionaries/components"} title={"Компоненты"}/>
                <MenuLink Icon={ElementIco} nested={true} url={"/dictionaries/users"} title={"Пользователи"}/>
            </MenuList>
        }

        {
            (hasAdminRights || hasSupervisorRights) &&
            <MenuLink Icon={TimelinesIco} url={"/timelines"}
                      title={'Таймлайны'}/>
        }

        { hasPmaRights && <MenuLink Icon={TimelinesIco} url={"/dashboard-records"}
                      title={'План публикаций'}/>}
    </nav>
}

type MenuLinkProps = {
    Icon: any,
    url: string,
    title: string,
    nested?: boolean
};

function MenuLink(props: MenuLinkProps) {
    const {Icon, url, title, nested, notifsCount} = props

    return <NavLink to={url} className={`side-bar-menu__item title-font ${nested ? 'nested' : ''}`}
                    activeClassName={"_active"}>
        <Icon/>
        <div className="side-bar-menu__item-title">{title}</div>
        <div className={`new-notifications-count ${notifsCount > 0 ? 'notif-c-active' : ''}`}>
            {notifsCount}
        </div>
    </NavLink>
}

type MenuListProps = {
    Icon: any,
    title: string,
};

function MenuList(props: MenuListProps) {
    const {Icon, title,} = props

    const [expanded, setExpanded] = useState(false)

    const _onClick = () => {
        setExpanded(!expanded)
    }

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
    return {
        hasSupervisorRights: hasSupervisorRights(state),
        hasAdminRights: hasAdminRights(state),
        hasPmaRights: hasPmaRights(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
        newNotifsCount: newNotifsCountSelector(state),
        unreadNotificationsCount: unreadCountSelector(state),
        notifications: notificationsSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SideBarMenu)
