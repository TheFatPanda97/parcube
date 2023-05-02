module.exports = {
  extends: "universe/native",
  rules: {
    "prettier/prettier": [
      "warn",
      {
        singleQuote: false,
      },
    ],
    "import/order": 0,
  },
};
