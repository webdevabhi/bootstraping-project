import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';

// PrimeReact imports
import "primereact/resources/themes/lara-light-indigo/theme.css";     // theme
import "primereact/resources/primereact.min.css";                     // core css
import "primeicons/primeicons.css";                                   // icons
import "primeflex/primeflex.css";                                     // PrimeFlex CSS utility

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
