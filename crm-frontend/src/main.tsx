import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { store } from './store';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#2E6DA4',
              colorInfo: '#2E6DA4',
              colorLink: '#2E6DA4',
              colorLinkHover: '#4A9BD2',
              borderRadius: 8,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            },
            components: {
              Menu: { darkItemSelectedBg: '#2E6DA4' },
              Button: { primaryShadow: '0 2px 0 rgba(12,36,70,0.10)' },
            },
          }}
        >
          <AntApp>
            <App />
          </AntApp>
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
