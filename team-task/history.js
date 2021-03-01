import createBrowserHistory from 'history/createBrowserHistory'
import {getConfirmation as getUserConfirmation} from "./components/messages/user-confirmation";

const browserHistory = createBrowserHistory({getUserConfirmation, basename: "tt"})

export default browserHistory
