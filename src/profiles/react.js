const React = require('react');
const ReactDOM = require('react-dom');

exports.start = function(context, onError) {
  if (!context.subject) {
    onError("No subject? No play!");
    return;
  }

  ReactDOM.render(<context.subject {...context.params} />, context.rootElement);
}

exports.stop = function(context) {
  ReactDOM.unmountComponentAtNode(context.rootElement);
};
