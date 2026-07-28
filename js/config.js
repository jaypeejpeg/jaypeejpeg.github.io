// Google Drive integration.
//
// Paste the API key between the quotes below and the on-site gallery turns on.
// While it is empty every "View Photos" button simply opens Google Drive instead,
// so the site keeps working either way.
//
// To create the key (once, about 5 minutes):
//   1. console.cloud.google.com  ->  new project, e.g. "jpeg-site"
//   2. APIs & Services  ->  Library  ->  enable "Google Drive API"
//   3. APIs & Services  ->  Credentials  ->  Create credentials  ->  API key
//   4. Edit the key and restrict it, both of these:
//        Application restrictions ->  Websites  ->  https://jaypeejpeg.github.io/*
//        API restrictions         ->  Restrict key  ->  Google Drive API
//   5. Paste it below and push.
//
// The key can only read folders already shared as "anyone with the link".
// It cannot reach private files, and it cannot upload, edit or delete anything.

window.JPEG_CONFIG = {
  driveApiKey: "AIzaSyCYOX0VZBpO2BiEJHNSJIBcQHl9P86goxs",
};
