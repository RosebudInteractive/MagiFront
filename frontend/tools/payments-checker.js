import {store} from "../store/configureStore";
import {getNonRegisterTransaction, sendRegisterTransactionSrc} from "ducks/google-analytics";
import {paymentPingIntervalSelector} from "ducks/app";

let _interval = null

export default class PaymentsChecker {
    static startPing() {
        if (!_interval) {
            const SECONDS = paymentPingIntervalSelector(store.getState()),
                PING_INTERVAL = SECONDS * 1000

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