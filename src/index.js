const React = require('react');
const ReactDOM = require('react-dom');
const RCE = require('../../../packages/bridge-cce/src/components/SlideEditor__RCE');

// window.I18n = {
//   t: function(x) { return String(x); }
// };
require('../../../test/features_setup');
require('../../../jsapp/config/initializers');
const GetSmart = require('GetSmart');

const GSHeartbeat = require('GetSmart/mixins/heartbeat');

GSHeartbeat.reopen({
  scheduleCheck() {},
  check() {},
  handleSuccess() {},
  handleFailure() {},
});

// const consoleError = console.error;

// // Workaround until we upgrade to React 15, see  https://github.com/facebook/fbjs/pull/153
// console.error = function(message) {
//   if (message === 'Warning: A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional.') {
//     return;
//   }

//   consoleError.apply(this, arguments);
// };

function render() {
  console.debug('Rendering  ...');
  ReactDOM.render(<RCE slide={{}} onChange={render} />, document.querySelector('#component'));
}

// GetSmart.initializer({
//   name: 'xoxo',

//   initialize: function(container, application) {
//     console.log(application.rootElement)
//     // Modal.setAppElement(application.rootElement);
//     // Modal.injectCSS();
//   }
// });
GetSmart.onReady(render);
// render();

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(function() {
    console.debug('Unmounting...');
    ReactDOM.unmountComponentAtNode(document.querySelector('#component'));
  });
}