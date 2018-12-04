var _ = require('lodash');

export class Messages {
    private _messages: Array<Message>;
    private _messageTypes: Array<string>;

    constructor() {
        this._messages = [];
        this._messageTypes = [];
        this.populateMessageTypes();
    }

    /**
     * Getter messages
     * @return {Array<Message>}
     */
    public get messages(): Array<Message> {
        return this._messages;
    }

    /**
     * Setter messages
     * @param {Array<Message>} value
     */
    public set messages(value: Array<Message>) {
        this._messages = value;
    }


    /**
     * Getter messageTypes
     * @return {Array<string>}
     */
    public get messageTypes(): Array<string> {
        return this._messageTypes;
    }

    /**
     * Setter messageTypes
     * @param {Array<string>} value
     */
    public set messageTypes(value: Array<string>) {
        this._messageTypes = value;
    }

    populateMessageTypes(): void {
        this.messageTypes.push("error");
        this.messageTypes.push("info");
        this.messageTypes.push("warn");
    }


    addMessage(severity: string, summary: string, detail: string): void {
        let message: Message;
        let messageDetail: MessageDetail;
        let messages = _.filter(this.messages, (msg) => msg.severity === severity);
        if (messages.length === 0) {
            message = new Message();
            message.severity = severity;
            this.messages.push(message);
        } else {
            message = messages[0];
        }

        messageDetail = new MessageDetail();
        messageDetail.summary = summary;
        messageDetail.detail = detail;
        message.details.push(messageDetail);
    }

}

export class Message {
    private _severity: string;
    private _details: Array<MessageDetail>;

    constructor() {
        this._details = [];
    }

    /**
     * Getter severity
     * @return {string}
     */
    public get severity(): string {
        return this._severity;
    }

    /**
     * Setter severity
     * @param {string} value
     */
    public set severity(value: string) {
        this._severity = value;
    }

    /**
     * Getter details
     * @return {Array<MessageDetail>}
     */
    public get details(): Array<MessageDetail> {
        return this._details;
    }

    /**
     * Setter details
     * @param {Array<MessageDetail>} value
     */
    public set details(value: Array<MessageDetail>) {
        this._details = value;
    }

}

export class MessageDetail {
    private _summary: string;
    private _detail: string;

    constructor() { }


    /**
     * Getter summary
     * @return {string}
     */
    public get summary(): string {
        return this._summary;
    }

    /**
     * Setter summary
     * @param {string} value
     */
    public set summary(value: string) {
        this._summary = value;
    }

    /**
     * Getter detail
     * @return {string}
     */
    public get detail(): string {
        return this._detail;
    }

    /**
     * Setter detail
     * @param {string} value
     */
    public set detail(value: string) {
        this._detail = value;
    }

}