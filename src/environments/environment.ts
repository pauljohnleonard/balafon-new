// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const environment = {
  production: false,
  firebaseConfig: {
    // storageBucket: 'gs://balafonix.appspot.com',
    apiKey: 'AIzaSyAckAlvyqgZa1QaobEuY1viqMQdpVyUIRY',
    authDomain: 'balafonix.firebaseapp.com',
    databaseURL: 'https://balafonix.firebaseio.com',
    projectId: 'balafonix',
    storageBucket: 'balafonix.appspot.com',
    messagingSenderId: '718701172075',
    appId: '1:718701172075:web:0a79b13a3e266a841ee82e',
    measurementId: 'G-49Q0XKTW4B',
  },
};
