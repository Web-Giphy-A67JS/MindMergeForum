# Firebase Setup Instructions

To resolve the error "Index not defined, add ".indexOn": "createdOn", for path "/posts", to the rules", follow these steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left sidebar, click on "Realtime Database".
4. Click on the "Rules" tab.
5. Update your rules to include the indexOn rule for the "posts" path. Your rules should look something like this:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "posts": {
      ".indexOn": "createdOn"
    }
  }
}
```

6. Click "Publish" to save your changes.

After updating the rules, the error should be resolved, and you should be able to query and sort posts based on the "createdOn" field efficiently.

Note: Make sure to adjust the read and write rules according to your security requirements. The example above allows read and write access to authenticated users only.