import { getIn } from 'immutable';
import { Selector, RequestMock, RequestLogger } from 'testcafe';

const getInput = id => Selector('input').withAttribute('name', id);

const assertNoConsoleErrors = async t => {
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error).eql([]);
};


// const envAPI = require('../../app/env_api.json');

// const params = window.location.search.replace('?', '');
// const env = params.split('=')[1];

// const sdkUrl = envAPI.prod;

// const r = `${sdkUrl}/mailbox/addresses/`.replace('/', '\/');
// const serviceRegex = new RegExp(r, 'i');

const registrationMock = RequestMock()
  .onRequestTo({
    url: new RegExp(`https:\/\/apiv1.telios.io\/mailbox\/addresses\/(.*)`, 'i'),
    method: 'GET',
    isAjax: false
  })
  .respond({ data: [] }, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS, HEAD, PUT, POST',
    'access-control-allow-headers': 'Content-Type'
  });

// const logger = RequestLogger(
//   {
//     url: 'https://apiv1.telios.io/mailbox/addresses/tester@telios.io',
//     method: 'GET',
//     isAjax: false
//   },
//   {
//     logRequestHeaders: true,
//     logRequestBody: true,
//     logResponseHeaders: true,
//     logResponseBody: true
//   }
// );

fixture`Login Screen`
  .page('../../app/login_window/index.html')
  .requestHooks(registrationMock)
  .afterEach(assertNoConsoleErrors);

test('Go to registration', async t => {
  await t
    .click('[data-tid="goto-registration"]')
    .typeText(getInput('email'), 'tester');
});
