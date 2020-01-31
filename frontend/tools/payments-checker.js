import {store} from "../store/configureStore";
import {getNonRegisterTransaction, sendRegisterTransactionSrc} from "ducks/google-analytics";

const PING_INTERVAL = 10 * 60 * 1000

let _interval = null

export default class PaymentsChecker {
    static startPing() {
        if (!_interval) {
            store.dispatch(getNonRegisterTransaction())

            _interval = setInterval(() => {
                store.dispatch(getNonRegisterTransaction())
            }, PING_INTERVAL)
        }
    }
}

export const callbackPayment = (id, systemName) => {
    console.log(`callback_payment :: START with params id:${id} systemName:${systemName}`)
    store.dispatch(sendRegisterTransactionSrc({id: id, systemName: systemName}))
}