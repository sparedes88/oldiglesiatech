// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://iglesia-tech-api.e2api.com/api/iglesiaTechApp',
  serverURL: 'https://iglesia-tech-api.e2api.com',
  server_calendar: 'https://iglesia-tech-v2.e2api.com',
  socket_server: 'https://iglesias-app-socket-api.e2api.com/',
  stripe_key: 'pk_test_1oZ34jJFJPKacd1IuoFccKJu',
  firebase: {
    apiKey: "AIzaSyA9MYtyyfezvFco_-vJ80rg1Qv_qk1eHcQ",
    authDomain: "iglesiatechapp.firebaseapp.com",
    databaseURL: "https://iglesiatechapp.firebaseio.com",
    projectId: "iglesiatechapp",
    storageBucket: "iglesiatechapp.appspot.com",
    messagingSenderId: "727159322563",
    appId: "1:727159322563:web:e5b8324e8ad47c5790ef76"
  },
  site_url: 'http://localhost:4200'
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
