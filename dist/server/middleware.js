'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.webpackValid = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (configDir) {
  // Build the webpack configuration using the `getBaseConfig`
  // custom `.babelrc` file and `webpack.config.js` files
  var config = (0, _config2.default)('DEVELOPMENT', (0, _webpack4.default)(), configDir);
  var middlewareFn = (0, _utils.getMiddleware)(configDir);

  // remove the leading '/'
  var publicPath = config.output.publicPath;
  if (publicPath[0] === '/') {
    publicPath = publicPath.slice(1);
  }

  var compiler = (0, _webpack2.default)(config);
  var devMiddlewareOptions = (0, _extends3.default)({
    noInfo: true,
    publicPath: config.output.publicPath,
    watchOptions: config.watchOptions || {}
  }, config.devServer);

  var router = new _express.Router();
  var webpackDevMiddlewareInstance = (0, _webpackDevMiddleware2.default)(compiler, devMiddlewareOptions);
  router.use(webpackDevMiddlewareInstance);
  router.use((0, _webpackHotMiddleware2.default)(compiler));

  // custom middleware
  middlewareFn(router);

  webpackDevMiddlewareInstance.waitUntilValid(function (stats) {
    var data = {
      publicPath: config.output.publicPath,
      assets: stats.toJson().assetsByChunkName
    };

    router.get('/', function (req, res) {
      var headHtml = (0, _utils.getManagerHeadHtml)(configDir);
      res.send((0, _index2.default)({ publicPath: publicPath, headHtml: headHtml }));
    });

    router.get('/iframe.html', function (req, res) {
      var headHtml = (0, _utils.getPreviewHeadHtml)(configDir);
      res.send((0, _iframe2.default)((0, _extends3.default)({}, data, { headHtml: headHtml, publicPath: publicPath })));
    });

    if (stats.toJson().errors.length) {
      webpackReject(stats);
    } else {
      webpackResolve(stats);
    }
  });

  return router;
};

var _express = require('express');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _webpack3 = require('./config/webpack.config');

var _webpack4 = _interopRequireDefault(_webpack3);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _index = require('./index.html');

var _index2 = _interopRequireDefault(_index);

var _iframe = require('./iframe.html');

var _iframe2 = _interopRequireDefault(_iframe);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var webpackResolve = function webpackResolve() {};
var webpackReject = function webpackReject() {};
var webpackValid = exports.webpackValid = new _promise2.default(function (resolve, reject) {
  webpackResolve = resolve;
  webpackReject = reject;
});