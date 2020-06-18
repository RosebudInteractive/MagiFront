'use strict';
const _ = require('lodash');
const config = require('config');
const request = require('request');
const { MrktBase } = require('./mrkt-base');

const SYS_CODE = "carrotquest";

class CarrotQuest extends MrktBase {

    constructor(options) {
        super(options);
        this._enabled = false;
        this._sys_code = SYS_CODE;
        if (config.has("mrktSystem.carrotquest.enabled") && config.has("mrktSystem.carrotquest.auth_token") &&
            config.get("mrktSystem.carrotquest.enabled") && config.get("mrktSystem.carrotquest.auth_token")) {
            this._enabled = true;
            this._auth_token = config.get("mrktSystem.carrotquest.auth_token");
        }
    }

    async _processPurchase(event, options) {
        let result = { succeeded: true };
        try {
            let opts = _.cloneDeep(options || {});
            opts.fields = {
                SysCode: this._sys_code,
                OpType: event.type,
                OpDate: new Date(),
                OpId: event.id,
                Trial: 1
            };
            let event_url = _.template(config.get("mrktSystem.carrotquest.urlEvents"))({ user_id: event.user_id });
            let prop_url = _.template(config.get("mrktSystem.carrotquest.urlProps"))({ user_id: event.user_id });

            // Order completed
            let params = {
                "$order_id": event.id,
                "$order_amount": event.revenue
            };
            let body = {
                auth_token: this._auth_token,
                by_user_id: true,
                event: "$order_completed",
                params: JSON.stringify(params)
            };
            opts.fields.SubType = body.event;
            opts.fields.Order = 1;
            await this._postData(event_url, body, opts);

            // Order paid
            params = {
                "$order_id": event.id,
            };
            body = {
                auth_token: this._auth_token,
                by_user_id: true,
                event: "$order_paid",
                params: JSON.stringify(params)
            };
            opts.fields.SubType = body.event;
            opts.fields.Order = 2;
            await this._postData(event_url, body, opts);

            // User props
            params = [];
            params.push({ op: 'update_or_create', key: '$last_payment', value: event.revenue }); // revenue - сумма последнего платежа
            params.push({ op: 'add', key: '$profit', value: event.revenue }); //revenue - сумма последнего платежа
            params.push({ op: 'add', key: '$orders_count', value: 1 });
            params.push({ op: 'delete', key: '$cart_items', value: 0 });
            params.push({ op: "delete", key: "$cart_amount", value: 0 });
            params.push({ op: 'delete', key: '$viewed_products', value: 0 },);
            params.push({ op: 'delete', key: '$viewed_categories', value: 0 });
            params.push({ op: 'delete', key: 'promocod_date', value: 0 });
            params.push({ op: 'delete', key: 'promocod', value: 0 });
            params.push({ op: 'union', key: '$ordered_categories', value: event.products[0].category }); //категория купленного товара
            params.push({ op: 'union', key: '$ordered_items', value: event.products[0].name }); //название купленного товара
            body = {
                auth_token: this._auth_token,
                by_user_id: true,
                operations: JSON.stringify(params)
            };
            opts.fields.SubType = "$set_props";
            opts.fields.Order = 3;
            await this._postData(prop_url, body, opts);
        }
        catch (err) {
            console.error(buildLogString(`CarrotQuest::_processPurchase: ${err}`));
            result = { succeeded: false, error: err };
        }
        return result;
    }

    async sendEvent(event, options) {
        let result = { succeeded: true };
        try {
            if (this._enabled) {
                if (!event)
                    throw new Error(`CarrotQuest::sendEvent: Missing or empty "event" arg.`);
                if (!event.type)
                    throw new Error(`CarrotQuest::sendEvent: Missing or empty "event" type.`);
                switch (event.type) {
                    case "purchase":
                        result = await this._processPurchase(event, options);
                        break;
                    default:
                        throw new Error(`CarrotQuest::sendEvent: Unsupported "event" type: "${event.type}".`);
                }
            }
        }
        catch (err) {
            console.error(buildLogString(`CarrotQuest::sendEvent: ${err}`));
            result = { succeeded: false, error: err };
        }
        return result;
    }
}

let carrotQuest = null;
exports.CarrotQuestService = () => {
    return carrotQuest ? carrotQuest : carrotQuest = new CarrotQuest();
}