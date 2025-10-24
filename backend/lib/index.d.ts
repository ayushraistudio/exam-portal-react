import * as functions from 'firebase-functions';
import { finalizeContest } from './scheduled/finalizeContest';
import { cleanupSessions } from './scheduled/cleanupSessions';
export declare const api: functions.HttpsFunction;
export { finalizeContest, cleanupSessions };
export declare const createStudent: functions.HttpsFunction & functions.Runnable<any>;
export declare const startContest: functions.HttpsFunction & functions.Runnable<any>;
export declare const requestRejoin: functions.HttpsFunction & functions.Runnable<any>;
export declare const approveRejoin: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=index.d.ts.map