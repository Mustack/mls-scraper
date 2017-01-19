var Rx = require('rx');

const queryData = {
  CultureId: 1,
  ApplicationId: 1,
  RecordsPerPage: 9,
  MaximumResults: 9,
  PropertySearchTypeId: 1,
  PriceMin: 100000,
  PriceMax: 450000,
  TransactionTypeId: 2,
  StoreyRange: '0-0',
  BedRange: '0-0',
  BathRange: '0-0',
  LongitudeMin: -75.69957733154297,
  LongitudeMax: -75.56370735168457,
  LatitudeMin: 45.36321135649902, // Don't change
  LatitudeMax: 45.42095453461164, // Don't change
  SortOrder: 'A',
  SortBy: 1,
  viewState: 'm',
  CurrentPage: 21,
  PropertyTypeGroupID: 1,
  Token: 'D6TmfZprLI9DXo9uooFJ+oc79wEmi/Ss4ENwpa1cVIE=',
  GUID: '55016750-1ba7-418d-9e81-09c3d70fddcc'
};


// This stream will find slices on the map that have fewer than 51 pages
// of results. realtor.ca seems to fail when you request the 51st page
// of its results. This is probably to stop scraping. This means we have to
// query a smaller geographical area to get fewer than 51 pages of results.
const mapSlice$ = Rx.Observable.create(observer => {
  // Yield a single value and complete
  observer.onNext(42);
  observer.onCompleted();

  // Any cleanup logic might go here
  return () => console.log('disposed')
});

const listings$ = mapSlice$.subscribe(
  x => console.log('onNext: %s', x),
  e => console.log('onError: %s', e),
  () => console.log('onCompleted'));

// => onNext: 42
// => onCompleted

listings$.dispose();
