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
            "lat": 12,
            "lng": -11,
            "name": "The best Spot",
            "description": "Place where people can stay",
            "price": 100
          },
          {
            'ownerId': 2,
            "address": "502 Should Exist Street",
            "city": "San diego",
            "state": "California",
            "country": "United States of America",
            "lat": 15,
            "lng": -15,
            "name": "The relaxing Spot",
            "description": "Place where people can relax",
            "price": 95
          },
          {
            'ownerId': 3,
            "address": "201 Should Exist Street",
            "city": "San diego",
            "state": "California",
            "country": "United States of America",
            "lat": 13,
            "lng": -13,
            "name": "The party Spot",
            "description": "Place where people can have fun",
            "price": 150
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
