// import { environment } from './environments/environment';

// import { ErrorComponent } from './error.component.ts';
// import { window } from 'global';

import { renderNgApp, renderNgError, renderNoPreviewComponent } from './angular/index.ts';

// check whether we're running on node/browser
// const isBrowser = typeof window !== 'undefined';

const logger = console;
// let rootEl = null;
let previousKind = '';
let previousStory = '';

export function renderError(error) {
  const properError = new Error(error.title);
  properError.stack = error.description;

  renderNgError(properError);
}

export function renderException(error) {
  // We always need to render redbox in the mainPage if we get an error.
  // Since this is an error, this affects to the main page as well.
  const realError = new Error(error.message);
  realError.stack = error.stack;
  renderNgError(realError);

  // Log the stack to the console. So, user could check the source code.
  logger.error(error.stack);
}

// const NoPreview = () => <p>No Preview Available!</p>;
// const noPreview = <NoPreview />;

export function renderMain(data, storyStore) {
  if (storyStore.size() === 0) return null;

  const { selectedKind, selectedStory } = data;

  const story = storyStore.getStory(selectedKind, selectedStory);
  if (!story) {
    renderNoPreviewComponent();
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

  const context = {
    kind: selectedKind,
    story: selectedStory,
  };

  const currentStory = story(context);
  let element;

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
  return renderNgApp(element);
}

export default function renderPreview({ reduxStore, storyStore }) {
  const state = reduxStore.getState();
  if (state.error) {
    return renderException(state.error);
  }

  try {
    return renderMain(state, storyStore);
  } catch (ex) {
    return renderException(ex);
  }
}
