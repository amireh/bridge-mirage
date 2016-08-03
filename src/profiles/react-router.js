const React = require('react');
const ReactDOM = require('react-dom');
const ReactRouter = require('react-router');
const { Route, HashLocation } = ReactRouter;

let router;

exports.start = function(context, onError) {
  const params = context.params || {};

  if (typeof params.path !== 'string') {
    onError("You must specify the route path for this handler!");

    return;
  }
  else if (!context.subject) {
    onError("No subject? No play!");
    return;
  }

  const routes = (
    <Route path="/">
      <Route
        path={params.path}
        handler={context.subject}
      />
    </Route>
  );

  router = ReactRouter.create({
    routes,
    location: HashLocation,
    onError: function(error) {
      console.error(error && error.stack || error);
      throw error;
    }
  });

  router.run((Handler, state) => {
    ReactDOM.render(<Handler {...state} />, context.rootElement);
  });
};

exports.stop = function(context) {
  if (router) {
    ReactDOM.unmountComponentAtNode(context.rootElement);

    router.stop();
    router = null;
  }
};

