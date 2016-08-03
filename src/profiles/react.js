const React = require('react');
const ReactDOM = require('react-dom');

module.exports = function(context, onError) {
  ReactDOM.unmountComponentAtNode(context.rootElement);

  if (!context.subject) {
    onError("No subject? No play!");
    return;
  }

  ReactDOM.render(<context.subject {...context.params} />, context.rootElement);
}
