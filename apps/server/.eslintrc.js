/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@sigma/eslint-config/server.js'],
  parserOptions: {
    project: true,
  },
};
