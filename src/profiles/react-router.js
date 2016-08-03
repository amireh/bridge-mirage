const React = require('react');
const ReactDOM = require('react-dom');
const ReactRouter = require('react-router');
const GetSmart = require('GetSmart');
const { Route, HashLocation } = ReactRouter;

let router;

exports.start = function(context, onError) {
  const params = context.params || {};
  const emberRouter = GetSmart.__container__.lookup("router:main");

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

  ignoreUnknownDestinations(router);
  ignoreUnknownEmberDestinations(emberRouter);

  router.run((Handler, state) => {
    ReactDOM.render(<Handler {...state} />, context.rootElement);
  });
};

exports.stop = function(context) {
  const emberRouter = GetSmart.__container__.lookup("router:main");

  if (router) {
    restoreEmberRouterIfNeeded(emberRouter);

    ReactDOM.unmountComponentAtNode(context.rootElement);

    router.stop();
    router = null;
  }
};

function ignoreUnknownDestinations(router) {
  const { makePath } = router;

  router.makePath = function() {
    try {
      return makePath.apply(router, arguments);
    }
    catch(e) {
      return '';
    }
  };
}

function ignoreUnknownEmberDestinations(emberRouter) {
  [ 'generate' ].forEach(function(method) {
    const original = emberRouter[method];

    emberRouter[method] = function() {
      try {
        return original.apply(emberRouter, arguments);
      }
      catch(e) {
        return '';
      }
    };

    emberRouter[method].restore = function() {
      emberRouter[method] = original;
    };
  });
}

function restoreEmberRouterIfNeeded(emberRouter) {
  [ 'generate' ].forEach(function(method) {
    if (emberRouter[method].restore instanceof Function) {
      emberRouter[method].restore();
    }
  });
}
