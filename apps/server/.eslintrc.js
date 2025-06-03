/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@sol/eslint-config/server.js'],
  parserOptions: {
    project: true,
  },
};
