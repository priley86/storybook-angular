'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = exports.getStorybook = exports.clearDecorators = exports.addDecorator = exports.setAddon = exports.storiesOf = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _global = require('global');

var _redux = require('redux');

var _addons = require('@storybook/addons');

var _addons2 = _interopRequireDefault(_addons);

var _channelPostmessage = require('@storybook/channel-postmessage');

var _channelPostmessage2 = _interopRequireDefault(_channelPostmessage);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _story_store = require('./story_store');

var _story_store2 = _interopRequireDefault(_story_store);

var _client_api = require('./client_api');

var _client_api2 = _interopRequireDefault(_client_api);

var _config_api = require('./config_api');

var _config_api2 = _interopRequireDefault(_config_api);

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

var _init = require('./init');

var _init2 = _interopRequireDefault(_init);

var _actions = require('./actions');

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// check whether we're running on node/browser
var isBrowser = _global.navigator && _global.navigator.userAgent !== 'storyshots' && !(_global.navigator.userAgent.indexOf('Node.js') > -1);

var storyStore = new _story_store2.default();
var reduxStore = (0, _redux.createStore)(_reducer2.default);
var context = { storyStore: storyStore, reduxStore: reduxStore };

if (isBrowser) {
  var queryParams = _qs2.default.parse(_global.window.location.search.substring(1));
  var channel = (0, _channelPostmessage2.default)({ page: 'preview' });
  channel.on('setCurrentStory', function (data) {
    reduxStore.dispatch((0, _actions.selectStory)(data.kind, data.story));
  });
  (0, _assign2.default)(context, { channel: channel, window: _global.window, queryParams: queryParams });
  _addons2.default.setChannel(channel);
  (0, _init2.default)(context);
}

var clientApi = new _client_api2.default(context);
var configApi = new _config_api2.default(context);

// do exports
var storiesOf = exports.storiesOf = clientApi.storiesOf.bind(clientApi);
var setAddon = exports.setAddon = clientApi.setAddon.bind(clientApi);
var addDecorator = exports.addDecorator = clientApi.addDecorator.bind(clientApi);
var clearDecorators = exports.clearDecorators = clientApi.clearDecorators.bind(clientApi);
var getStorybook = exports.getStorybook = clientApi.getStorybook.bind(clientApi);
var configure = exports.configure = configApi.configure.bind(configApi);

// initialize the UI
var renderUI = function renderUI() {
  if (isBrowser) {
    (0, _render2.default)(context);
  }
};

reduxStore.subscribe(renderUI);