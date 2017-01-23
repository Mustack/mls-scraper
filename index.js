const Rx = require('rx');
const mongodb = require('promised-mongo');

const htmlListingScraper = require('./htmlListingScraper');
const {getListingsPage} = require('./requestHelpers');

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
  LongitudeMin:-75.9629487991333,
  LongitudeMax:-75.4194688796997,
  LatitudeMin:45.266398626775796, // Don't change
  LatitudeMax:45.497412480399944, // Don't change
  SortOrder: 'A',
  SortBy: 1,
  viewState: 'm',
  CurrentPage: 1,
  PropertyTypeGroupID: 1,
  Token: 'D6TmfZprLI9DXo9uooFJ+oc79wEmi/Ss4ENwpa1cVIE=',
  GUID: '55016750-1ba7-418d-9e81-09c3d70fddcc'
};

const db = mongodb('mls-scraper');

// This stream will find slices on the map that have fewer than 51 pages
// of results. realtor.ca seems to fail when you request the 51st page
// of its results. This is probably to stop scraping. This means we have to
// query a smaller geographical area to get fewer than 51 pages of results.
const mapSlice$ = Rx.Observable.create(observer => {
  let callCount = 0;

  // Recursively searches for smaller and smaller slices until there are
  // fewer than 51 pages of results.
  function findSlice(start, width) {
    callCount++;

    const subsectionQueryData = Object.assign(queryData, {
      LongitudeMin: start,
      LongitudeMax: queryData.LongitudeMin + width
    });

    getListingsPage(subsectionQueryData)
      .then(result => {
        const pageNum = result.Paging.TotalPages;
        console.log(`start: ${start}, width: ${width}, pages: ${pageNum}`);

        if (pageNum > 50) {
          // recurse with half the width
          const half = width / 2;
          findSlice(start, half);
          findSlice(start + half, width);
        } else {
          // This is a small enough slice to yield to the next observable
          observer.onNext({queryData: subsectionQueryData, result});
        }

        callCount--;
        if (callCount === 0) {
          observer.onCompleted();
        }
      });
  }

  findSlice(queryData.LongitudeMin, queryData.LongitudeMax - queryData.LongitudeMin);

  // Any cleanup logic might go here
  return () => console.log('disposed')
})
.filter(({result}) => result.Results.length)
.flatMap(function getListingPages({queryData, result}) {
  return Rx.Observable.create(observer => {
    observer.onNext(result.Results);

    for(let i=2; i<result.Paging.TotalPages; i++) {
      getListingsPage(Object.assign(queryData, {CurrentPage: i}))
        .then(page => observer.onNext(page.Results));
    }
  });
})
.flatMap(Rx.Observable.fromArray)
.flatMap(listing => {
  // If it exists, return false so the filter operation can
  // filter out this listing
  const existsInDb = db.Listings.findOne({Id: listing.Id})
    .then(result => result ? false : listing);

  return Rx.Observable.fromPromise(existsInDb);
})
.filter(listing => listing) // Don't do anything if it already exists
.flatMap(listing => {
  const listingInserted = htmlListingScraper(listing)
    .then(newListing => db.Listings.insert(newListing));

  return Rx.Observable.fromPromise(listingInserted);
})
.subscribe(updatedListing => console.log(`Added listing ${Object.keys(updatedListing.detailedInfo).length}`));
