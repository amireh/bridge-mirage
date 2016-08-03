const path = require('path');
const fs = require('fs');
const RUNNER_PATH = path.resolve(__dirname, '../tmp/context.js');

const template = function(context) {
  if (!context.profile || !context.subject) {
    return 'console.warn("Mirage: invalid runner context.");';
  }

  let buffer = `
// AUTO GENERATED! DO NOT EDIT!
// ----------------------------
exports.profile = "${context.profile}";
exports.subject = require("${context.subject}");
exports.subjectPath = "${context.subjectPath}";
  `;

  if (context.paramsFile) {
    buffer += `\nexports.paramsFile = "${context.paramsFile}";`
    buffer += `\nexports.params = require("${context.paramsFile}");`
  }
  else if (context.params) {
    buffer += `\nexports.params = ${context.params};`;
  }

  return buffer;
};

module.exports = function(context) {
  fs.writeFileSync(RUNNER_PATH, template(context));
};