// Рантайм-конфиг: подменяется на проде без пересборки (например, в CI/CD или прямо на хостинге),
// поэтому URL прокси не зашивается в билд через import.meta.env.
window.__APP_ENV__ = {
  API_PROXY_URL: 'https://d5du1ocg9mmhl975fae4.0ly8ed4d.apigw.yandexcloud.net',
};
