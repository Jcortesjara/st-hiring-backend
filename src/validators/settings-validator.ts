import Joi from 'joi';


const deliveryMethodSchema = Joi.object({
    name: Joi.string().required(),
    enum: Joi.string().required(),
    order: Joi.number().required(),
    isDefault: Joi.boolean().required(),
    selected: Joi.boolean().required(),
});

const fulfillmentFormatSchema = Joi.object({
    rfid: Joi.boolean().required(),
    print: Joi.boolean().required(),
});

const printerSchema = Joi.object({
    id: Joi.allow(null).required(),
});

const printingFormatSchema = Joi.object({
    formatA: Joi.boolean().required(),
    formatB: Joi.boolean().required(),
});

const scanningSchema = Joi.object({
    scanManually: Joi.boolean().required(),
    scanWhenComplete: Joi.boolean().required(),
});

const paymentMethodsSchema = Joi.object({
    cash: Joi.boolean().required(),
    creditCard: Joi.boolean().required(),
    comp: Joi.boolean().required(),
});

const ticketDisplaySchema = Joi.object({
    leftInAllotment: Joi.boolean().required(),
    soldOut: Joi.boolean().required(),
});

const customerInfoSchema = Joi.object({
    active: Joi.boolean().required(),
    basicInfo: Joi.boolean().required(),
    addressInfo: Joi.boolean().required(),
});



const settingsSchema = Joi.object({
    clientId: Joi.number().optional(),
    deliveryMethods: Joi.array().items(deliveryMethodSchema).required(),
    fulfillmentFormat: fulfillmentFormatSchema.required(),
    printer: printerSchema.required(),
    printingFormat: printingFormatSchema.required(),
    scanning: scanningSchema.required(),
    paymentMethods: paymentMethodsSchema.required(),
    ticketDisplay: ticketDisplaySchema.required(),
    customerInfo: customerInfoSchema.required(),
});

export const validateSettings = (settings: any) => {
    return settingsSchema.validate(settings);
};