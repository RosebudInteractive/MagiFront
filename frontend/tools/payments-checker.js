import {store} from "../store/configureStore";
import {getNonRegisterTransaction} from "ducks/google-analytics";

const KEY = "_lpd",
    FULL_INTERVAL = 2 * 60 * 60 * 1000,
    PING_INTERVAL = 15 * 60 * 1000

export default class PaymentsChecker {

    static setPaymentDate() {
        localStorage.setItem(KEY, Date.now())
    }

    static hasPendingPayment() {
        return !!localStorage.getItem(KEY)
    }

    static clear() {
        localStorage.removeItem(KEY)
    }

    static startPing() {
        setTimeout(
            () => {
                let _lastPaymentDate = localStorage.getItem(KEY)

                if (!_lastPaymentDate) {
                    return
                }

                const _timeBetween = Date.now() - _lastPaymentDate

                if (_timeBetween > FULL_INTERVAL) {
                    this.clear()
                    return
                }

                store.dispatch(getNonRegisterTransaction())
            },
            PING_INTERVAL)
    }
}