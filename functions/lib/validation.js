"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhone = exports.validateEmail = exports.validateZipCode = void 0;
const functions = __importStar(require("firebase-functions"));
const zod_1 = require("zod");
exports.validateZipCode = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        zipCode: zod_1.z.string().min(5).max(10),
        address: zod_1.z.object({
            addressLine1: zod_1.z.string(),
            addressLine2: zod_1.z.string().optional(),
            city: zod_1.z.string(),
            state: zod_1.z.string()
        }).optional()
    });
    try {
        const { zipCode, address } = schema.parse(data);
        const isValid = !zipCode.startsWith('9');
        let suggestions = [];
        if (!isValid && address) {
            suggestions = [
                {
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    city: address.city,
                    state: address.state,
                    zipCode: zipCode.replace(/^9/, '1'),
                    confidence: 0.9
                },
                {
                    addressLine1: address.addressLine1,
                    addressLine2: address.addressLine2,
                    city: address.city,
                    state: address.state,
                    zipCode: zipCode.replace(/^9/, '2'),
                    confidence: 0.8
                }
            ];
        }
        return {
            isValid,
            zipCode,
            suggestions,
            serviceableAreas: isValid ? ['standard', 'express'] : [],
            estimatedDeliveryDays: isValid ? 3 : null
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid ZIP code data');
        }
        console.error('Error validating ZIP code:', error);
        throw new functions.https.HttpsError('internal', 'ZIP code validation failed');
    }
});
exports.validateEmail = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email()
    });
    try {
        const { email } = schema.parse(data);
        const isValid = zod_1.z.string().email().safeParse(email).success;
        return {
            isValid,
            email,
            domain: email.split('@')[1],
            suggestions: !isValid ? ['Please check the email format'] : []
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid email data');
        }
        console.error('Error validating email:', error);
        throw new functions.https.HttpsError('internal', 'Email validation failed');
    }
});
exports.validatePhone = functions.https.onCall(async (data, context) => {
    const schema = zod_1.z.object({
        phone: zod_1.z.string(),
        countryCode: zod_1.z.string().optional().default('+91')
    });
    try {
        const { phone, countryCode } = schema.parse(data);
        const cleanPhone = phone.replace(/\D/g, '');
        const isValid = countryCode === '+91' ?
            /^[6-9]\d{9}$/.test(cleanPhone) :
            cleanPhone.length >= 7 && cleanPhone.length <= 15;
        return {
            isValid,
            phone: cleanPhone,
            countryCode,
            formattedPhone: isValid && countryCode === '+91' ?
                `${countryCode}-${cleanPhone.slice(0, 5)}-${cleanPhone.slice(5)}` :
                `${countryCode}-${cleanPhone}`,
            carrier: isValid ? 'Unknown' : null
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid phone data');
        }
        console.error('Error validating phone:', error);
        throw new functions.https.HttpsError('internal', 'Phone validation failed');
    }
});
//# sourceMappingURL=validation.js.map