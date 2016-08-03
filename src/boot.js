if (module.hot) {
  module.hot.decline(); // need a full reload, can't reload Ember!
}

require('test/features_setup');
require('jsapp/config/initializers');

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
        "Authorization": process.env.BRIDGE_API_TOKEN
      });
    });
  }
});

module.exports = GetSmart.onReady;