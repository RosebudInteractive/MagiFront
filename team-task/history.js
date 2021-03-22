import {createBrowserHistory} from "history"
import {getConfirmation as getUserConfirmation} from "./components/messages/user-confirmation";

const browserHistory = createBrowserHistory({getUserConfirmation, basename: "pm"})

export default browserHistory
