'use strict';
const _ = require('lodash');
const config = require('config');
const { HttpCode } = require("../../../../const/http-codes");
const { NotificationBase } = require('../../notification-api');
const { ApplicationType, NotificationType,
    NotifDeliveryType, NotificationTopicType, AllowedNotifDelivery,
    NotificationMsgType, NotifRecipientType, NotifRecipientStatus, NotifCallStatus } = require('../../const');
const {
    SNSClient,
    SubscribeCommand,
    ListTopicsCommand,
    GetEndpointAttributesCommand,
    SetEndpointAttributesCommand,
    CreateTopicCommand,
    DeleteTopicCommand,
    CreatePlatformEndpointCommand,
    GetTopicAttributesCommand,
    UnsubscribeCommand,
    PublishCommand,
    GetSubscriptionAttributesCommand
} = require("@aws-sdk/client-sns");

const AwsNotification = class AwsNotification extends NotificationBase{

    static #instance = null;
    static getInstance() {
        return AwsNotification.#instance ? AwsNotification.#instance : AwsNotification.#instance = new AwsNotification();
    }

    #client = null;
    #region = null;
    #platformApp = {};
    #logAttrs = null;

    constructor(options) {
        super(options);
        this.#region = config.get("notifications.region");
        this.#platformApp = config.get("notifications.platformApp");
        if (config.has("notifications.providerLogs.app")) {
            let cfg = config.get("notifications.providerLogs.app");
            this.#logAttrs = {};
            for (let key in cfg)
                this.#logAttrs[key] = cfg[key];
        }
        this.#client = new SNSClient({
            credentials: {
                accessKeyId: config.get("notifications.accessKeyId"),
                secretAccessKey: config.get("notifications.secretAccessKey")
            },
            region: this.#region
        });
    }

    async _onCreateTopic(topicObj) {
        await super._onCreateTopic(topicObj);

        let data;
        let status = NotifCallStatus.Ok;
        try {
            let input = { Name: topicObj.name(), Attributes: {} };
            if (this.#logAttrs) {
                input.Attributes = _.defaults(input.Attributes, this.#logAttrs)
            }
            const command = new CreateTopicCommand(input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                    { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.Error;
        }
        topicObj.extData(data);
        topicObj.status(status);
    }

    async __createEndpoint(epObj) {
        let data;
        let status = NotifCallStatus.Ok;
        try {
            let platform_arn;
            let platform;
            switch (epObj.appTypeId()) {
                case ApplicationType.ios:
                    platform_arn = this.#platformApp.ios;
                    platform = "ios";
                    if (!platform_arn)
                        throw new Error(`Unsupported platform application: "ios".`)
                    break;
                case ApplicationType.android:
                    platform_arn = this.#platformApp.android;
                    platform = "android";
                    if (!platform_arn)
                        throw new Error(`Unsupported platform application: "android".`)
                    break;
                default:
                    throw new Error(`Unsupported AppTypeId: ${epObj.appTypeId()}.`)
            }

            let input = {
                PlatformApplicationArn: platform_arn,
                Token: epObj.token(),
                CustomUserData: JSON.stringify({ devId: epObj.devId(), activeUserId: epObj.activeUserId(), platform: platform })
            };
            const command = new CreatePlatformEndpointCommand(input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error.$metadata && error.message) {
                const REGEXP_EXISTS = ".*Endpoint (arn:aws:sns[^ ]+) already exists with the same [Tt]oken.*";
                let match = error.message.match(REGEXP_EXISTS);
                if (match && Array.isArray(match) && (match.length === 2)) {
                    data = { EndpointArn: match[1], message: "Already exists, EndpointArn has been retrieved." };
                }
            }
            if (!data) {
                if (error instanceof Error)
                    data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                        { errorClass: "Error", message: error.message, stack: error.stack }
                else
                    data = { serializedErr: JSON.stringify(error) };
                status = NotifCallStatus.Error;
            }
        }
        epObj.extData(data);
        epObj.status(status);
    }

    async _onCreateEndpoint(epObj) {
        await super._onCreateEndpoint(epObj);

        let result;
        let data;
        let isGetFailed;
        let status = NotifCallStatus.Ok;
        let endPointArn = epObj.extData() ? epObj.extData().EndpointArn : null;
        if (!endPointArn) {
            await this.__createEndpoint(epObj);
            if (epObj.status(status) === NotifCallStatus.Ok) {
                endPointArn = epObj.extData() ? epObj.extData().EndpointArn : null;
            }
        }
        if (endPointArn) {
            try {
                isGetFailed = true;
                const command = new GetEndpointAttributesCommand({ EndpointArn: endPointArn });
                let { Attributes } = await this.#client.send(command);
                isGetFailed = false;
                if (!((Attributes.Token === epObj.token()) && (Attributes.Enabled === 'true'))) {
                    let input = {
                        Attributes: {
                            Token: epObj.token(),
                            Enabled: 'true'
                        },
                        EndpointArn: endPointArn
                    }
                    await this.#client.send(new SetEndpointAttributesCommand(input));
                }
            }
            catch (err) {
                if (isGetFailed && (err.$metadata.httpStatusCode === HttpCode.ERR_NOT_FOUND))
                    result = this.__createEndpoint(epObj)
                else {
                    if (error instanceof Error)
                        data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                            { errorClass: "Error", message: error.message, stack: error.stack }
                    else
                        data = { serializedErr: JSON.stringify(error) };
                    status = NotifCallStatus.Error;
                    subsObj.extData(data);
                    subsObj.status(status);
                }
                return result;
            }
        }
        return result;
    }

    async _onDeleteSubscription(subsObj) {
        let data;
        let status = NotifCallStatus.Ok;
        try {
            let input = { SubscriptionArn: subsObj.extData() ? subsObj.extData().SubscriptionArn : null };
            const command = new UnsubscribeCommand (input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                    { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.Error;
        }
        subsObj.extData(data);
        subsObj.status(status);
        return super._onDeleteSubscription(subsObj);
    }

    async _onUpdateSubscription(topic, endPoint, subsObj) {
        await super._onUpdateSubscription(topic, endPoint, subsObj);
        let data;
        let status = NotifCallStatus.Ok;
        let props = data = subsObj.extData();
        if (props && props.SubscriptionArn) {
            try {
                const command = new GetSubscriptionAttributesCommand({ SubscriptionArn: props.SubscriptionArn });
                let { Attributes } = await this.#client.send(command);
                if (!((endPoint.ExtData.EndpointArn === Attributes.Endpoint) &&
                    (topic.ExtData.TopicArn === Attributes.TopicArn))) {
                    await this._onDeleteSubscription(subsObj);
                    return this._onAddSubscription(topic, endPoint, subsObj);
                }
            }
            catch (err) {
                if (err.$metadata.httpStatusCode === HttpCode.ERR_NOT_FOUND)
                    return this._onAddSubscription(topic, endPoint, subsObj)
                else {
                    if (error instanceof Error)
                        data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                            { errorClass: "Error", message: error.message, stack: error.stack }
                    else
                        data = { serializedErr: JSON.stringify(error) };
                    status = NotifCallStatus.Error;
                    subsObj.extData(data);
                    subsObj.status(status);
                }
            }
        }
    }

    async _onAddSubscription(topic, endPoint, subsObj) {
        await super._onAddSubscription(topic, endPoint, subsObj);
        let data;
        let status = NotifCallStatus.Ok;
        try {
            let protocol;
            switch (subsObj.typeId()) {
                case NotifDeliveryType.app:
                    protocol = "application";
                    break;
                case NotifDeliveryType.email:
                    throw new Error(`Email subscription is not supported.`);
                    break;
                default:
                    throw new Error(`Unsupported AppTypeId: ${subsObj.typeId()}.`);
            }
            let input = {
                Protocol: protocol,
                TopicArn: topic && topic.ExtData ? topic.ExtData.TopicArn : null,
                Endpoint: endPoint && endPoint.ExtData ? endPoint.ExtData.EndpointArn : null
            };
            const command = new SubscribeCommand(input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                    { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.Error;
        }
        subsObj.extData(data);
        subsObj.status(status);
    }

    _adjustMessage(message) {
        if (!message.text)
            throw new Error(`Missing "text" section in a message.`);
        let buildAPNS = () => {
            let aps = {};
            let apns = { aps: aps };
            if (message.title)
                aps.alert = { title: message.title, body: message.text }
            else
                aps.alert = message.text;
            if (message.custom)
                apns.data = message.custom;
            return apns;
        }
        let buildGCM = () => {
            let gcm = { notification: { body: message.text} };
            if (message.title)
                gcm.notification.title = message.title;
            if (message.custom)
                for (let key in message.custom) {
                    if (!gcm.data)
                        gcm.data = {};
                    switch (typeof (message.custom[key])) {
                        case "string":
                        case "boolean":
                        case "number":
                            gcm.data[key] = message.custom[key].toString();
                            break;
                        default:
                            gcm.data[key] = JSON.stringify(message.custom[key]);
                    }
                }
            return gcm;
        }
        let message_struct = {
            default: message.text,
            APNS: buildAPNS(),
            GCM: buildGCM()
        };
        for (let key in message_struct)
            if (typeof (message_struct[key]) !== "string")
                message_struct[key] = JSON.stringify(message_struct[key]);
        return message_struct;
    }

    async _onPublishMessage(message, recObj, recData) {
        await super._onPublishMessage(message, recObj, recData);
        let data;
        let status = NotifCallStatus.Ok;
        try {
            let topic_arn;
            let target_arn;
            let message_struct = this._adjustMessage(message);
            
            switch (recObj.type()) {
                case NotifRecipientType.Topic:
                    topic_arn = recData && recData.ExtData ? recData.ExtData.TopicArn : null;
                    break;
                case NotifRecipientType.Endpoint:
                    target_arn = recData && recData.ExtData ? recData.ExtData.EndpointArn : null;
                    break;
                default:
                    throw new Error(`Unsupported Type: ${recObj.type()}.`);
            }
            let input = {
                Message: JSON.stringify(message_struct),
                MessageStructure: "json",
                TopicArn: topic_arn,
                TargetArn: target_arn
            };
            const command = new PublishCommand(input);
            data = {
                message: message_struct,
                result: await this.#client.send(command)
            }
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? { message: error.message, $metadata: error.$metadata } :
                    { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.Error;
        }
        recObj.extData(data);
        recObj.status(status);
    }
}

exports.NotificationService = AwsNotification.getInstance;