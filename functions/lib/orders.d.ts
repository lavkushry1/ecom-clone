import * as functions from 'firebase-functions';
export declare const processOrder: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const updateOrderStatus: functions.HttpsFunction & functions.Runnable<any>;
export declare const getOrderById: functions.HttpsFunction & functions.Runnable<any>;
export declare const getUserOrders: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=orders.d.ts.map