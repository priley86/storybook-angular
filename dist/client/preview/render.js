'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderError = renderError;
exports.renderException = renderException;
exports.renderMain = renderMain;
exports.default = renderPreview;

var _index = require('./angular/index.ts');

// check whether we're running on node/browser
// const isBrowser = typeof window !== 'undefined';

var logger = console;
// let rootEl = null;
// import { environment } from './environments/environment';

// import { ErrorComponent } from './error.component.ts';
// import { window } from 'global';

var previousKind = '';
var previousStory = '';

function renderError(error) {
  var properError = new Error(error.title);
  properError.stack = error.description;

  (0, _index.renderNgError)(properError);
}

function renderException(error) {
  // We always need to render redbox in the mainPage if we get an error.
  // Since this is an error, this affects to the main page as well.
  var realError = new Error(error.message);
  realError.stack = error.stack;
  (0, _index.renderNgError)(realError);

  // Log the stack to the console. So, user could check the source code.
  logger.error(error.stack);
}

// const NoPreview = () => <p>No Preview Available!</p>;
// const noPreview = <NoPreview />;

function renderMain(data, storyStore) {
  if (storyStore.size() === 0) return null;

  var selectedKind = data.selectedKind,
      selectedStory = data.selectedStory;


  var story = storyStore.getStory(selectedKind, selectedStory);
  if (!story) {
    (0, _index.renderNoPreviewComponent)();
    logger.log('no story');
    return null;
  }

  // Unmount the previous story only if selectedKind or selectedStory has changed.
  // renderMain() gets executed after each action. Actions will cause the whole
  // story to re-render without this check.
  //    https://github.com/storybooks/react-storybook/issues/116
  if (selectedKind !== previousKind || previousStory !== selectedStory) {
    // We need to unmount the existing set of components in the DOM node.
    // Otherwise, React may not recrease instances for every story run.
    // This could leads to issues like below:
    //    https://github.com/storybooks/react-storybook/issues/81
    previousKind = selectedKind;
    previousStory = selectedStory;
    // ReactDOM.unmountComponentAtNode(rootEl);
  }

  var context = {
    kind: selectedKind,
    story: selectedStory
  };

  var currentStory = story(context);
  var element = void 0;

  if (currentStory.render && typeof currentStory.render === 'function') {
    element = currentStory.render();
  } else {
    element = currentStory;
  }

  logger.log(element);
  // if (!element) {
  //   const error = {
  //     title: `Expecting a React element from the story: "${selectedStory}" of "${selectedKind}".`,
  //     description: stripIndents`
  //       Did you forget to return the React element from the story?
  //       Use "() => (<MyComp/>)" or "() => { return <MyComp/>; }" when defining the story.
  //     `,
  //   };
  //   return renderError(error);
  // }

  // if (element.type === undefined) {
  //   const error = {
  //     title: `Expecting a valid React element from the story: "${selectedStory}" of "${selectedKind}".`,
  //     description: stripIndents`
  //       Seems like you are not returning a correct React element from the story.
  //       Could you double check that?
  //     `,
  //   };
  //   return renderError(error);
  // }

  logger.log('generate module');
  return (0, _index.renderNgApp)(element);
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