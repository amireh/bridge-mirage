if (module.hot) {
  module.hot.decline(); // need a full reload, can't reload Ember!
}

require('../../../test/features_setup');
require('../../../jsapp/config/initializers');

const GetSmart = require('GetSmart');
const GSHeartbeat = require('GetSmart/mixins/heartbeat');
const $ = require('jquery');

GetSmart.Router.reopen({
  location: "none",
});

GSHeartbeat.reopen({
  scheduleCheck() {},
  check() {},
  handleSuccess() {},
  handleFailure() {},
});

GetSmart.initializer({
  name: "stamp ajax requests with the Authorization headers",
  initialize: function() {
    $.ajaxPrefilter(function(options) {
      options.headers = Object.assign({}, options.headers, {
        "Authorization": 'Basic YjI0MDc3ZjAtZmRmOC00ODg0LTk4N2ItMTk4OThiN2JmYzMzOjY3ZTg5NDU2LWRhYTAtNGY0OS04NGI1LTFjNGExZWE3ODY3Ng=='
      });
    });
  }
});

module.exports = GetSmart.onReady;