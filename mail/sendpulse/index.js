'use strict';
const _ = require('lodash');
const { SendPulseService } = require('../../services/mail-subscription/sp-service');

const allowed_msg_fields = ["text", "html", "subject", "from", "to"];

let SendPulseMail = class {
    constructor() {
        this._spMail = SendPulseService();
    }

    async sendMail(message) {
        if (!message)
            throw new Error(`SendPulseMail::sendMail: Parameter "message" couldn't be empty.`);
        let msg = {};
        for (let k = 0; k < allowed_msg_fields.length; k++) {
            let fld = allowed_msg_fields[k];
            if (message[fld]) {
                let val = message[fld];
                msg[fld] = val;
                switch (fld) {
                    case "from":
                        let from_arg;
                        let arr = val.split("<");
                        switch (arr.length) {
                            case 1:
                                from_arg = { email: arr[0] };
                                break;
                            
                            case 2:
                                from_arg = {
                                    name: arr[0].trim().replace(/\"/g, ""),
                                    email: arr[1].replace(">", "")
                                };
                                break;
                            default:
                                throw new Error(`SendPulseMail::sendMail: Invalid "from" arg: "${JSON.stringify(val)}".`);
                        }
                        msg[fld] = from_arg;
                        break;
                    
                    case "to":
                        let to_arg = val;
                        if (typeof (val) === "string") {
                            to_arg = val.split(",");
                        }
                        if (!Array.isArray(to_arg))
                            throw new Error(`SendPulseMail::sendMail: Invalid "to" arg: "${JSON.stringify(val)}".`);
                        for (let i = 0; i < to_arg.length; i++)
                            to_arg[i] = { email: to_arg[i] };
                        msg[fld] = to_arg;
                        break;
                }
            }
        }
        let res = await this._spMail.smtpSendMail(msg);
        if (res && res.error_code)
            throw new Error(`SendPulseMail::sendMail: Error code: ${res.error_code}, message: "${res.message}"`);
        return res;
    }
}

let sendPulseMail = null;
exports.SendPulseMail = () => {
    return sendPulseMail ? sendPulseMail : sendPulseMail = new SendPulseMail();
};