module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@pages": "./pages",
            "@customTypes": "./customTypes",
            "@assets": "./assets",
            "@contexts": "./contexts",
            "@utils": "./utils",
            "@hooks": "./hooks",
            "@components": "./components",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
