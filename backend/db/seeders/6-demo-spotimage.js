'use strict';

const { SpotImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await SpotImage.bulkCreate(
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
    } catch (err) {
      console.log(err);
    }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    return queryInterface.bulkDelete(
      options,
      {}
    );
  },
};
