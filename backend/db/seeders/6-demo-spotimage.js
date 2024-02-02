'use strict';


let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  up: (queryInterface, Sequelize) => {
    options.tableName = 'SpotImages'; // Define table name in options object
    return queryInterface.bulkInsert(options,
        [
          {
            spotId: 1,
            url: "image10",
            preview: true,
          },
          {
            spotId: 2,
            url: "image11",
            preview: true,
          },
          {
            spotId: 3,
            url: "image12",
            preview: true,
          },
        ],
        { validate: true }
      );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'SpotImages'
    await queryInterface.bulkDelete(options);
  },
};
