/**
 * Source https://developer.mozilla.org/en-US/docs/Web/API/notification
 * @param params
 */

export function desktopNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === 'granted') {
    new Notification(title, options)
  }
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification')
  }

  // Otherwise, we need to ask the user for permission
  else if (
    Notification.permission !== 'denied' &&
    Notification.permission !== 'granted'
  ) {
    Notification.requestPermission().then(function (permission) {
      console.log(permission)
    })
  }
}
