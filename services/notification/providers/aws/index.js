'use strict';
const _ = require('lodash');
const config = require('config');
const { NotificationBase } = require('../../notification-api');
const { ApplicationType, NotificationType,
    NotifDeliveryType, NotificationTopicType, AllowedNotifDelivery,
    NotificationMsgType, NotifRecipientType, NotifRecipientStatus, NotifCallStatus } = require('../../const');
const {
    SNSClient,
    SubscribeCommand,
    ListTopicsCommand,
    GetEndpointAttributesCommand,
    CreateTopicCommand,
    DeleteTopicCommand,
    CreatePlatformEndpointCommand,
    GetTopicAttributesCommand,
    UnsubscribeCommand,
    PublishCommand
} = require("@aws-sdk/client-sns");

const AwsNotification = class AwsNotification extends NotificationBase{

    static #instance = null;
    static getInstance() {
        return AwsNotification.#instance ? AwsNotification.#instance : AwsNotification.#instance = new AwsNotification();
    }

    #client = null;
    #region = null;
    #platformApp = {};

    constructor(options) {
        super(options);
        this.#region = config.get("notifications.region");
        this.#platformApp = config.get("notifications.platformApp");
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
        let status = NotifCallStatus.ok;
        try {
            let input = { Name: topicObj.name() };
            const command = new CreateTopicCommand(input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? error : { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.error;
        }
        topicObj.extData(data);
        topicObj.status(status);
    }

    async _onCreateEndpoint(epObj) {
        await super._onCreateEndpoint(epObj);

        let data;
        let status = NotifCallStatus.ok;
        try {
            let platform_arn;
            switch (epObj.appTypeId()) {
                case ApplicationType.ios:
                    platform_arn = this.#platformApp.ios;
                    if (!platform_arn)
                        throw new Error(`Unsupported platform application: "ios".`)
                    break;
                case ApplicationType.android:
                    platform_arn = this.#platformApp.android;
                    if (!platform_arn)
                        throw new Error(`Unsupported platform application: "android".`)
                    break;
                default:
                    throw new Error(`Unsupported AppTypeId: ${epObj.appTypeId()}.`)
            }

            let input = { PlatformApplicationArn: platform_arn, Token: epObj.token() };
            const command = new CreatePlatformEndpointCommand(input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? error : { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.error;
        }
        epObj.extData(data);
        epObj.status(status);
    }

    async _onDeleteSubscription(subsObj) {
        let data;
        let status = NotifCallStatus.ok;
        try {
            let input = { SubscriptionArn: subsObj.extData() ? subsObj.extData().SubscriptionArn : null };
            const command = new UnsubscribeCommand (input);
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? error : { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.error;
        }
        subsObj.extData(data);
        subsObj.status(status);
        return super._onDeleteSubscription(subsObj);
    }

    async _onAddSubscription(topic, endPoint, subsObj) {
        await super._onAddSubscription(topic, subsObj);
        let data;
        let status = NotifCallStatus.ok;
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
                data = error.$metadata ? error : { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.error;
        }
        subsObj.extData(data);
        subsObj.status(status);
    }

    async _onPublishMessage(message, recObj, recData) {
        await super._onPublishMessage(message, recObj, recData);
        let data;
        let status = NotifCallStatus.ok;
        try {
            let topic_arn;
            let target_arn;
            let message_struct = _.cloneDeep(message);
            if (!message_struct.default)
                throw new Error(`Missing "default" section in message.`);
            for (let key in message_struct)
                if (typeof (message_struct[key]) !== "string")
                    message_struct[key] = JSON.stringify(message_struct[key]);
            
           switch (recObj.type()) {
                case NotifRecipientType.topic:
                    topic_arn = recData && recData.ExtData ? recData.ExtData.TopicArn : null;
                    break;
                case NotifRecipientType.endPoint:
                    throw new Error(`Endpoint publication is not supported.`);
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
            data = await this.#client.send(command);
        }
        catch (error) {
            if (error instanceof Error)
                data = error.$metadata ? error : { errorClass: "Error", message: error.message, stack: error.stack }
            else
                data = { serializedErr: JSON.stringify(error) };
            status = NotifCallStatus.error;
        }
        recObj.extData(data);
        recObj.status(status);
    }
}

exports.NotificationService = AwsNotification.getInstance;