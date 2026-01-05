// Firebase and API Configuration
export const config = {
  // API Configuration
  apiUrl: 'https://iglesia-tech-api.e2api.com/api/iglesiaTechApp',
  serverURL: 'https://iglesia-tech-api.e2api.com',
  serverCalendar: 'https://iglesiatech.app',
  socketServer: 'https://iglesias-app-socket-api.e2api.com/',
  
  // Firebase Configuration - API Keys Storage (New Backend)
  firebase: {
    apiKey: "AIzaSyDQNM2ktuL0FqBQBa7MxPkCM3dz_U_timw",
    authDomain: "igletechserv12.firebaseapp.com",
    databaseURL: "https://igletechserv12-default-rtdb.firebaseio.com",
    projectId: "igletechserv12",
    storageBucket: "igletechserv12.appspot.com",
    messagingSenderId: "1014696295911",
    appId: "1:1014696295911:web:YOUR_APP_ID"
  },
  
  // Firebase Configuration - Original Production Database (Church Data)
  firebaseData: {
    apiKey: "AIzaSyB2LbLlxl-OkvC8EfZkr3K-hfUALnLdVtg",
    authDomain: "iglesiatechapp.firebaseapp.com",
    databaseURL: "https://iglesiatechapp.firebaseio.com",
    projectId: "iglesiatechapp",
    storageBucket: "iglesiatechapp.appspot.com",
    messagingSenderId: "279482146853",
    appId: "1:279482146853:web:f8b9e4c3d2a1b0c9d8e7f6"
  },
  
  siteUrl: 'https://iglesiatech.app'
};

// Development configuration (uncomment to use local API)
// export const config = {
//   apiUrl: 'http://localhost:9999/api/iglesiaTechApp',
//   serverURL: 'http://localhost:9999',
//   serverCalendar: 'https://iglesia-tech-v2.e2api.com',
//   socketServer: 'https://iglesias-app-socket-api.e2api.com/',
//   firebase: {
//     apiKey: "AIzaSyDQNM2ktuL0FqBQBa7MxPkCM3dz_U_timw",
//     authDomain: "igletechserv12.firebaseapp.com",
//     databaseURL: "https://igletechserv12-default-rtdb.firebaseio.com",
//     projectId: "igletechserv12",
//     storageBucket: "igletechserv12.appspot.com",
//     messagingSenderId: "1014696295911",
//     appId: "1:1014696295911:web:YOUR_APP_ID"
//   },
//   siteUrl: 'https://iglesiatech.app'
// };
