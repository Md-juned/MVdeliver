import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Cuisine = sequelize.define(
    "Cuisine",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "active",
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: TableNames.cuisines, // Add name in your dbConstants
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  Cuisine.associate = (models) => {
    Cuisine.hasMany(models.Restaurant, {
      foreignKey: "cuisine_id",
      as: "restaurants",
    });
  };

  return Cuisine;
};
