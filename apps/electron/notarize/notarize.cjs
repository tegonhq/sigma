const {notarize} = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const {electronPlatformName, appOutDir} = context;

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.log('  • notarizing: missing APPLE_ID or APPLE_ID_PASSWORD');
    console.log('  • notarizing: skipping notarization');
    return;
  }

  if (electronPlatformName !== 'darwin') {
    return;
  }

  console.log(
    `  • notarizing: ${process.env.APPLE_ID}, ${context.packager.appInfo.productFilename}`,
  );

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: 'notarytool',
    appBundleId: 'com.sol.sol-desktop',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    teamId: process.env.TEAM_ID,
  })
    .then(() =>
      console.log(
        `  • notarizing: successfully notarized ${context.packager.appInfo.productFilename}`,
      ),
    )
    .catch(err => {
      console.log('  • notarizing: error', err);
    });
};
