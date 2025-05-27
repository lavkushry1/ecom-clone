import * as functions from 'firebase-functions';
export declare const sendNotification: functions.HttpsFunction & functions.Runnable<any>;
export declare const sendBulkNotification: functions.HttpsFunction & functions.Runnable<any>;
export declare const sendOrderConfirmation: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const sendOrderStatusUpdate: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const getNotificationHistory: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=notifications.d.ts.map