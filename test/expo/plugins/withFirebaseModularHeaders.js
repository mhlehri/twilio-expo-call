const { withPodfile } = require("@expo/config-plugins");

const withFirebaseModularHeaders = (config) => {
  return withPodfile(config, async (config) => {
    let contents = config.modResults.contents;

    // Find and update the post_install hook
    const postInstallRegex = /post_install do \|installer\|[\s\S]*?^end$/m;
    const postInstallMatch = contents.match(postInstallRegex);

    if (postInstallMatch) {
      const oldPostInstall = postInstallMatch[0];
      const newPostInstall = oldPostInstall.replace(
        /post_install do \|installer\|/,
        `post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Fix for Firebase + React-RuntimeHermes module conflicts
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end`
      );

      contents = contents.replace(oldPostInstall, newPostInstall);
    } else {
      // If no post_install block exists, add one at the end
      const newPostInstall = `
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Fix for Firebase + React-RuntimeHermes module conflicts
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
  end
end
`;
      contents = contents + newPostInstall;
    }

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withFirebaseModularHeaders;
