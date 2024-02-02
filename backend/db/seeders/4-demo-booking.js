'use strict';



let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  up: (queryInterface, Sequelize) => {
    options.tableName = 'Bookings'; // Define table name in options object
    return queryInterface.bulkInsert(options,
        [
          {
            userId: 1,
            spotId: 2,
            startDate: "2050-12-23",
            endDate: "2051-01-05",
          },
          {
            userId: 2,
            spotId: 3,
            startDate: "2050-12-15",
            endDate: "2050-12-21",
          },
          {
            userId: 3,
            spotId: 1,
            startDate: "2051-01-07",
            endDate: "2051-01-14",
          },
        ],
        { validate: true }
      );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings'
    return queryInterface.bulkDelete(options);
  },
};
