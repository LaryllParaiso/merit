const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const AGP_VERSION = '8.10.1';
const GRADLE_WRAPPER_VERSION = '8.11.1';

const updated = [];

function patchFile(relativePath, patcher) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const before = fs.readFileSync(fullPath, 'utf8');
  const after = patcher(before);

  if (after !== before) {
    fs.writeFileSync(fullPath, after, 'utf8');
    updated.push(relativePath);
  }
}

patchFile('android/build.gradle', (s) =>
  s.replace(
    /com\.android\.tools\.build:gradle:[0-9.]+/g,
    `com.android.tools.build:gradle:${AGP_VERSION}`
  )
);

patchFile('android/capacitor-cordova-android-plugins/build.gradle', (s) =>
  s.replace(
    /com\.android\.tools\.build:gradle:[0-9.]+/g,
    `com.android.tools.build:gradle:${AGP_VERSION}`
  )
);

patchFile('android/gradle/wrapper/gradle-wrapper.properties', (s) =>
  s.replace(
    /^distributionUrl=.*$/m,
    `distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE_WRAPPER_VERSION}-all.zip`
  )
);

if (updated.length > 0) {
  console.log(`Patched: ${updated.join(', ')}`);
} else {
  console.log('No changes needed');
}
