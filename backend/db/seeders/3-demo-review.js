'use strict';


let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  async up(queryInterface, Sequelize) {
      options.tableName = 'Reviews'
      await queryInterface.bulkInsert(options,
        [
          {
            userId: 1,
            spotId: 1,
            review: "This place is awesome",
            stars: 5,
          },
          {
            userId: 2,
            spotId: 3,
            review: "This place is Ok",
            stars: 3,
          },
          {
            userId: 3,
            spotId: 1,
            review: "This place is horrible",
            stars: 1,
          },
        ],
        { validate: true }
      );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    return queryInterface.bulkDelete(options);
  },
};
