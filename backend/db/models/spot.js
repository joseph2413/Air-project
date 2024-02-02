"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Spot extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			Spot.hasMany(models.Booking, {
				foreignKey: "spotId",
				onDelete: "CASCADE",
				hooks: true,
			});
			Spot.hasMany(models.SpotImage, {
				foreignKey: "spotId",
				onDelete: "CASCADE",
				hooks: true,
			});
			Spot.hasMany(models.Review, {
				foreignKey: "spotId",
				onDelete: "CASCADE",
				hooks: true,
			});
			Spot.belongsTo(models.User, {as: "Owner", foreignKey: "ownerId" });
		}
	}
	Spot.init(
		{
			ownerId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				onDelete: "CASCADE",
			},
			address: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: { msg: "Street address is required" },
					notEmpty: { msg: "Street address is required" },
				},
			},
			city: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: { msg: "City is required" },
					notEmpty: { msg: "City is required" },
				},
			},
			state: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: { msg: "State is required" },
					notEmpty: { msg: "State is required" },
				},
			},
			country: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: { msg: "Country is required" },
					notEmpty: { msg: "Country is required" },
				},
			},
			lat: {
				type: DataTypes.FLOAT,
				allowNull: false,
				validate: {
					notNull: { msg: "Latitude is not valid" },
					notEmpty: { msg: "Latitude is not valid" },
					// -90 through 90
					min: {
						args: -90,
						msg: "Latitude is not valid",
					},
					max: {
						args: 90,
						msg: "Latitude is not valid",
					},
				},
			},
			lng: {
				type: DataTypes.FLOAT,
				allowNull: false,
				validate: {
					notNull: { msg: "Longitude is not valid" },
					notEmpty: { msg: "Longitude is not valid" },
					// -180 through 180
					min: {
						args: -180,
						msg: "Longitude is not valid",
					},
					max: {
						args: 180,
						msg: "Longitude is not valid",
					},
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: { msg: "Name must be less than 50 characters" },
					notEmpty: { msg: "Name must be less than 50 characters" },
					len: {
						args: [0, 50],
						msg: "Name must be less than 50 characters",
					},
				},
			},
			description: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: { msg: "Description is required" },
					notEmpty: { msg: "Description is required" },
				},
			},
			price: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					notNull: { msg: "Price per day is required - null" },
					min: {
						args: -1,
						msg: "Price per day is required",
					},
				},
			},
		},
		{
			sequelize,
			modelName: "Spot",
		},
	);
	return Spot;
};
