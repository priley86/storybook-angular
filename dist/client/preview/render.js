'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderError = renderError;
exports.renderException = renderException;
exports.renderMain = renderMain;
exports.default = renderPreview;

var _helpers = require('./angular/helpers.ts');

var logger = console;
var previousKind = '';
var previousStory = '';

function renderError(error) {
  var err = new Error(error.title);
  err.stack = error.description;

  (0, _helpers.renderNgError)(err);
}

function renderException(error) {
  // We always need to render redbox in the mainPage if we get an error.
  // Since this is an error, this affects to the main page as well.
  var err = new Error(error.message);
  err.stack = error.stack;
  (0, _helpers.renderNgError)(err);

  // Log the stack to the console. So, user could check the source code.
  logger.error(error.stack);
}

function renderMain(data, storyStore) {
  if (storyStore.size() === 0) return null;

  var selectedKind = data.selectedKind,
      selectedStory = data.selectedStory;


  var story = storyStore.getStory(selectedKind, selectedStory);
  if (!story) {
    (0, _helpers.renderNoPreview)();
    return null;
  }

  // Unmount the previous story only if selectedKind or selectedStory has changed.
  // renderMain() gets executed after each action. Actions will cause the whole
  // story to re-render without this check.
  //    https://github.com/storybooks/react-storybook/issues/116

  var reRender = selectedKind !== previousKind || previousStory !== selectedStory;
  if (reRender) {
    // We need to unmount the existing set of components in the DOM node.
    // Otherwise, React may not recrease instances for every story run.
    // This could leads to issues like below:
    //    https://github.com/storybooks/react-storybook/issues/81
    previousKind = selectedKind;
    previousStory = selectedStory;
  }
  var context = {
    kind: selectedKind,
    story: selectedStory
  };
  return (0, _helpers.renderNgApp)(story, context, reRender);
}

function renderPreview(_ref) {
  var reduxStore = _ref.reduxStore,
      storyStore = _ref.storyStore;

  var state = reduxStore.getState();
  if (state.error) {
    return renderException(state.error);
  }

  try {
    return renderMain(state, storyStore);
  } catch (ex) {
    return renderException(ex);
  }
}