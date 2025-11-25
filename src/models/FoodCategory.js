import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const FoodCategory = sequelize.define("FoodCategory", {   // 🔥 MODEL NAME FIXED

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
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

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

  }, {
    tableName: TableNames.foodCategory,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",
  });

  return FoodCategory;
};
