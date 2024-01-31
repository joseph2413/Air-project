'use strict';

const { ReviewImage } = require("../models");


let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await ReviewImage.bulkCreate(
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
    } catch (err) {
      console.log(err);
    }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "ReviewImages";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      {}
    );
  },
};
