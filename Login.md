```
json

{
  "expo": {
    "name": "Foodlog",
    "slug": "Foodlog",
    "scheme": "foodlog",
    "android": {
      "package": "com.foodlog.foodlog"
    },
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_WEB_CLIENT_ID_PREFIX"
        }
      ]
    ]
  }
}

```

```
JavaScript
import React, { useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { 
  GoogleSignin, 
  statusCodes 
} from '@react-native-google-signin/google-signin';

export default function LoginScreen() {

  useEffect(() => {
    // Configure client ID once when app loads
    GoogleSignin.configure({
      // Use your Google Cloud Web Client ID here (crucial even for mobile apps)
      webClientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', 
      
      // Request extra scopes if needed, e.g., Google Drive scope
      scopes: ['https://www.googleapis.com/auth/drive.file'], 
      
      offlineAccess: true, // Set to true if you need a Refresh Token
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices();
      
      // Prompt user to select account and sign in
      const response = await GoogleSignin.signIn();
      
      // Extract tokens and user info depending on response structure
      const userInfo = response.data ? response.data : response;
      console.log('LOGGED IN USER:', userInfo.user);
      console.log('ID TOKEN:', userInfo.idToken);
      
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is operational and in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Android play services not available or outdated');
      } else {
        console.error('Some other error happened:', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={handleGoogleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
```