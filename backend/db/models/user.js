"use strict";
const { Model } = require("sequelize");
const { Validator } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			// User.hasMany(models.Booking, {
			// 	foreignKey: "userId",
			// 	onDelete: "CASCADE",
			// 	hooks: true,
			// });
			User.hasMany(models.Spot, {
				foreignKey: "userId",
				onDelete: "CASCADE",
				hooks: true,
			});
			User.hasMany(models.Review, {
				foreignKey: "userId",
				onDelete: "CASCADE",
				hooks: true,
			});
		}
	}
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(val) {
            if (Validator.isEmail(val)) {
              throw Error("UserName cannot be an email!");
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword", "email", "createdAt", "updatedAt"],
        },
      },
    }
  );
  return User;
};
