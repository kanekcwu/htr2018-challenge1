import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

//import 'bootstrap/dist/css/bootstrap.min.css';
import 'theme-machine/dist/business-tycoon/css/bootstrap4-business-tycoon.min.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
