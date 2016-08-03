// exports.profile = require('./profiles/react-router');
// exports.context = {
//   path: '/author/courses/:courseId/slides/:slideId',
//   component: require('../../../packages/bridge-cce/src/SlideShowRouteHandler')
// };

exports.profile = require('./profiles/react');
exports.context = {
  params: {
    slide: {}
  },
  component: require('../../../packages/bridge-cce/src/components/SlideEditor__RCE')
};