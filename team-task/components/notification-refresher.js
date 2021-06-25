import {useEffect,} from "react"
import {useLocation} from "react-router-dom"

const TIME_INTERVAL = .2 * 60 * 1000

type Props = {
    getList: Function,
    getUnreadCount: Function
}

class Timer {
    init({getList, getUnreadCount}) {
        this.getList = getList
        this.getUnreadCount = getUnreadCount

        if (this._timer) {this.stop()}
        this._timer = setInterval(::this._getData, TIME_INTERVAL)
    }

    setLocation(location) {
        this.location = location
    }

    _getData() {
        if(location.pathname.includes('notifications')){
            this.getList()
        } else {
            this.getUnreadCount()
        }
    }

    stop() {
        clearInterval(this._timer)
        this._timer = null
    }
}

const timer = new Timer()

export default function NotificationRefresher(props: Props) {
    const {getList, getUnreadCount} = props
    const location = useLocation()

    useEffect(() => {
        timer.setLocation(location)
    }, [location])

    useEffect(() => {
        timer.init({getList, getUnreadCount})

        return () => {
            timer.stop()
        }
    }, [])

    return null
}


