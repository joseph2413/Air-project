"use strict";

const { User } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await User.bulkCreate(
        [
          {
            email: "demo@user.io",
            username: "DemoU",
            hashedPassword: bcrypt.hashSync("password"),
          },
          {
            email: "user10@user.io",
            username: "Fake10",
            hashedPassword: bcrypt.hashSync("password2"),
          },
          {
            email: "user20@user.io",
            username: "Fake20",
            hashedPassword: bcrypt.hashSync("password3"),
          },
        ],
        { validate: true }
      );
    } catch (err) {
      console.log(err);
    }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        username: { [Op.in]: ["DemoU", "Fake10", "Fake20"] },
      },
      {}
    );
  },
};
