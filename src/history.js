import createBrowserHistory from 'history/createBrowserHistory'
import {getConfirmation as getUserConfirmation} from "./components/userConfirmation";

const browserHistory = createBrowserHistory({getUserConfirmation})

export default browserHistory