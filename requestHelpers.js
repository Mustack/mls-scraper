const request = require('request-promise');
const pThrottle = require('p-throttle');

const getListingsPage = pThrottle(queryData => {
  return request({
    method: 'POST',
    uri: 'https://api2.realtor.ca/Listing.svc/PropertySearch_Post',
    form: queryData
  })
  .then(result => JSON.parse(result))
  .catch(err => console.log(`failed listing page request: ${err}`));
}, 1, 1000);

const getListingHtml = pThrottle(url => {
  return request({
    method: 'GET',
    uri: 'https://www.realtor.ca' + url,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-GB,en;q=0.8,en-US;q=0.6,fr-CA;q=0.4,fr;q=0.2',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Cookie': 'D_SID=198.84.222.245:FCeI718Q6DnGFKUXbkJwfAeq5+CR+RCeYhMYi10QQSY; ARRAffinity=49a951d615f97140ab9c6583764b42a5dcf7cb276e1db2d56d39c89e2412d7f8; GUID=a327ce3a-b959-4a26-b7b2-1a651ebae747; location_tab_hint=1; MAP_BACK_URL=https%3A%2F%2Fwww.realtor.ca%2FMap.aspx%23CultureId%3D1%26ApplicationId%3D1%26RecordsPerPage%3D9%26MaximumResults%3D9%26PropertySearchTypeId%3D1%26PriceMax%3D400000%26TransactionTypeId%3D2%26StoreyRange%3D0-0%26BedRange%3D0-0%26BathRange%3D0-0%26LongitudeMin%3D-75.78910946846008%26LongitudeMax%3D-75.72117447853088%26LatitudeMin%3D45.36454560012051%26LatitudeMax%3D45.39074165719603%26SortOrder%3DA%26SortBy%3D1%26viewState%3Dm%26CurrentPage%3D1%26PropertyTypeGroupID%3D1; Language=1; app_mode=1; Province=Ontario; Country=Canada; cookieTest=val; cookieTestCP=val; D_PID=966A936F-309B-31C5-A009-FFE117276318; D_IID=896DFB40-9EB8-3774-8438-69C462E6ACC4; D_UID=C0D85847-BA6E-3F1A-874D-B27EE9781429; D_HID=v7zd8jpy9vvfE8CzD3mgZglueIXerO5phy/H/TacgRE; D_ZID=D69346A3-431B-33D5-85E1-28A974BA4E17; D_ZUID=1E224DDA-F681-3590-9B53-10D6999CDB7C',
      'DNT': '1',
      'Host': 'www.realtor.ca',
      'Pragma': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
    }
  })
  .catch(err => console.log(`failed html request: ${err}`));
}, 1, 1000);

module.exports = {getListingsPage, getListingHtml}
