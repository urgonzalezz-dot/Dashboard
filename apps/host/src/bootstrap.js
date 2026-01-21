import { createRoot } from 'react-dom/client';
/* import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client'; */
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createAppStore } from '@libs/redux';
import FatalError from './components/FatalError/FatalError';
import App from './app/app';

const store = createAppStore();

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <FatalError>
        <App />
      </FatalError>
    </Provider>
  </BrowserRouter>
);
