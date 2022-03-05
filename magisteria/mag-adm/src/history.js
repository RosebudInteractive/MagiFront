import createBrowserHistory from 'history/createBrowserHistory'
import {getConfirmation as getUserConfirmation} from "./components/dialog/user-confirmation";

const browserHistory = createBrowserHistory({getUserConfirmation})

export default browserHistory