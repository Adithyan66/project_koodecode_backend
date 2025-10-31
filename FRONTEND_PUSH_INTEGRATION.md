# Web Push Notifications - Frontend Integration Guide

This guide explains how to integrate Web Push Notifications with your frontend application.

## Overview

The backend provides Web Push API endpoints that allow browsers to receive push notifications even when the application tab is closed or the browser is minimized.

## Prerequisites

- Modern browser with Push API support (Chrome, Firefox, Edge, Safari 16+)
- HTTPS connection (required for Service Workers)
- User permission for notifications

## API Endpoints

### Get VAPID Public Key
```
GET /api/user/notifications/vapid-public-key
```
Returns the public VAPID key needed for subscribing to push notifications.

### Subscribe to Notifications
```
POST /api/user/notifications/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "userAgent": "Mozilla/5.0..."
}
```

### Unsubscribe from Notifications
```
DELETE /api/user/notifications/unsubscribe
Authorization: Bearer <token>
```

### Admin: Send Notification
```
POST /api/admin/notifications/send
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "ADMIN_ANNOUNCEMENT",
  "title": "System Maintenance",
  "body": "Scheduled maintenance tonight at 10 PM",
  "targetType": "all",
  "icon": "https://example.com/icon.png"
}
```

Target types:
- `all`: All subscribed users
- `specific`: Specific users (requires `targetUserIds` array)
- `contest`: Contest participants (requires `contestId`)

## Implementation Steps

### 1. Create Service Worker

Create `public/sw.js` in your frontend project:

```javascript
self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/badge.png',
    data: data.data,
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
```

### 2. Register Service Worker

In your main application file (e.g., `main.tsx` or `App.tsx`):

```typescript
// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers not supported');
  }
}
```

### 3. Request Notification Permission

```typescript
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
```

### 4. Subscribe to Push Notifications

```typescript
async function subscribeToPushNotifications(apiBaseUrl: string, token: string) {
  try {
    // Get VAPID public key from backend
    const vapidResponse = await fetch(`${apiBaseUrl}/api/user/notifications/vapid-public-key`);
    const { data } = await vapidResponse.json();
    const vapidPublicKey = data.publicKey;

    // Register service worker
    const registration = await registerServiceWorker();

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // Send subscription to backend
    const response = await fetch(`${apiBaseUrl}/api/user/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        },
        userAgent: navigator.userAgent
      })
    });

    const result = await response.json();
    console.log('Subscribed to push notifications:', result);
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return false;
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | null) {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
```

### 5. Unsubscribe from Push Notifications

```typescript
async function unsubscribeFromPushNotifications(apiBaseUrl: string, token: string) {
  try {
    // Unsubscribe from push manager
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
    }

    // Notify backend
    const response = await fetch(`${apiBaseUrl}/api/user/notifications/unsubscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    console.log('Unsubscribed from push notifications:', result);
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}
```

### 6. React Hook Example

```typescript
import { useState, useEffect } from 'react';

export function usePushNotifications(apiBaseUrl: string, token: string | null) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }, []);

  const subscribe = async () => {
    if (!token) {
      console.error('User not authenticated');
      return false;
    }

    const success = await subscribeToPushNotifications(apiBaseUrl, token);
    setIsSubscribed(success);
    return success;
  };

  const unsubscribe = async () => {
    if (!token) {
      console.error('User not authenticated');
      return false;
    }

    const success = await unsubscribeFromPushNotifications(apiBaseUrl, token);
    setIsSubscribed(!success);
    return success;
  };

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  };
}
```

### 7. UI Component Example

```tsx
import { usePushNotifications } from './hooks/usePushNotifications';

function NotificationSettings() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications(
    import.meta.env.VITE_API_URL,
    localStorage.getItem('token')
  );

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <p>Push notifications are not supported in your browser.</p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <h3>Push Notifications</h3>
      <p>
        {isSubscribed
          ? 'You will receive browser notifications for important updates.'
          : 'Enable push notifications to stay updated.'}
      </p>
      <button onClick={isSubscribed ? unsubscribe : subscribe}>
        {isSubscribed ? 'Disable' : 'Enable'} Notifications
      </button>
    </div>
  );
}
```

## Notification Types

The backend sends different types of notifications:

- `CONTEST_STARTING`: When a contest begins
- `CONTEST_ENDED`: When a contest ends
- `CONTEST_REMINDER`: 10 minutes before contest start
- `ADMIN_ANNOUNCEMENT`: Admin broadcasts
- `SYSTEM_ALERT`: System alerts
- `FRIEND_REQUEST`: Friend requests
- `MENTION`: When mentioned by another user
- `ACHIEVEMENT`: Achievement unlocked

Access notification data in the service worker:

```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  // Handle different notification types
  switch (data.data.type) {
    case 'CONTEST_STARTING':
      // Navigate to contest page on click
      data.data.url = `/contests/${data.data.contestId}`;
      break;
    case 'ACHIEVEMENT':
      // Navigate to profile
      data.data.url = '/profile';
      break;
    // ... handle other types
  }
  
  // Show notification
});
```

## Testing

### Testing on Localhost

1. Use `localhost` (works over HTTP for development)
2. Or use a service like `ngrok` for HTTPS tunneling

### Testing Push Notifications

```typescript
// After subscribing, you can test by sending a notification from admin panel
// Or use the browser's DevTools:

// 1. Open DevTools → Application → Service Workers
// 2. Click "Push" to simulate a push event
// 3. Enter JSON payload:
{
  "title": "Test Notification",
  "body": "This is a test",
  "icon": "/logo.png",
  "data": {
    "type": "SYSTEM_ALERT",
    "url": "/"
  }
}
```

## Browser Support

- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16+ (macOS 13+)
- ❌ Safari < 16
- ❌ Internet Explorer

## Troubleshooting

### Notifications not appearing

1. Check browser notification permissions
2. Verify service worker is registered and active
3. Check browser console for errors
4. Ensure HTTPS (or localhost for development)

### Subscription fails

1. Verify VAPID public key is correct
2. Check network requests for errors
3. Ensure user is authenticated
4. Verify backend is running and accessible

### Service Worker not updating

1. Clear browser cache
2. Unregister old service worker
3. Hard reload page (Ctrl+Shift+R)

## Security Considerations

1. Always use HTTPS in production
2. Validate user authentication before subscribing
3. Store VAPID keys securely (environment variables)
4. Handle subscription errors gracefully
5. Provide easy opt-out mechanism

## Best Practices

1. Request notification permission at appropriate times (not immediately on page load)
2. Explain why notifications are useful before requesting permission
3. Provide clear opt-in/opt-out UI
4. Test notifications thoroughly before production
5. Monitor notification delivery rates
6. Handle edge cases (offline, permission denied, etc.)

## Additional Resources

- [MDN Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Web.dev Push Notifications](https://web.dev/push-notifications-overview/)

