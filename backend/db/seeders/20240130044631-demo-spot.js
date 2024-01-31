'use strict';

const { Spot } = require("../models");


let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await Spot.bulkCreate(
        [
          {
            'ownerId': 1,
            "address": "500 Should Exist Street",
            "city": "San diego",
            "state": "California",
            "country": "United States of America",
            "lat": 39.7645358,
            "lng": -115.4730327,
            "name": "The best Spot",
            "description": "Place where people can stay",
            "price": 503
          },
          {
            'ownerId': 2,
            "address": "502 Should Exist Street",
            "city": "San diego",
            "state": "California",
            "country": "United States of America",
            "lat": 47.7645358,
            "lng": -132.4730327,
            "name": "The relaxing Spot",
            "description": "Place where people can relax",
            "price": 506
          },
          {
            'ownerId': 3,
            "address": "201 Should Exist Street",
            "city": "San diego",
            "state": "California",
            "country": "United States of America",
            "lat": 40,
            "lng": -130,
            "name": "The party Spot",
            "description": "Place where people can have fun",
            "price": 1000
          }
        ],
        { validate: true }
      );
    } catch (err) {
      console.log(err);
    }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    return queryInterface.bulkDelete(
      options,
      {}
    );
  },
};
