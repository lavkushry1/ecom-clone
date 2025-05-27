import * as functions from 'firebase-functions';
export declare const updateStock: functions.HttpsFunction & functions.Runnable<any>;
export declare const bulkUpdateStock: functions.HttpsFunction & functions.Runnable<any>;
export declare const setStockAlert: functions.HttpsFunction & functions.Runnable<any>;
export declare const createRestockRequest: functions.HttpsFunction & functions.Runnable<any>;
export declare const getInventoryReport: functions.HttpsFunction & functions.Runnable<any>;
export declare const updateStockOnOrder: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const restoreStockOnOrderCancel: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
//# sourceMappingURL=inventory.d.ts.map