'use strict';

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages'
      return queryInterface.bulkInsert(options,
        [
          {
            reviewId: 1,
            url: 'image5'
          },
          {
            reviewId: 2,
            url: 'image6'
          },
          {
            reviewId: 3,
            url: 'image7'
          },
        ],
        { validate: true }
      );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages'
    return queryInterface.bulkDelete(options);
  },
};
