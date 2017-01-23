const cheerio = require('cheerio');
const deepCopy = require('deepCopy');

const {getListingHtml} = require('./requestHelpers');

function parseString(str) {
  if (isNaN(str)) {
    return str;
  }

  return parseInt(str);
}

function htmlListingScraper(listing) {
  return getListingHtml(listing.RelativeDetailsURL)
    .then(html => {
      let newListing = deepCopy(listing);
      let detailedInfo = {};
      $ = cheerio.load(html);

      $('.m_property_dtl_data_td_val').each((i, elem) => {
        const id = elem.attribs.id
          .split('m_property_dtl_data_val_').pop()
          .split('m_property_dtl_blddata_val_').pop();
        const value = $(elem).text();

        detailedInfo[id] = parseString(value);

        // Get a numeric value for condo fees
        if (id === 'monthlymaintenancefees') {
          detailedInfo.condoFeesNum = parseString(value.match(/\d+/)[0]);
        }
      });

      newListing.detailedInfo = detailedInfo;
      return newListing;
    });
}

module.exports = htmlListingScraper;
