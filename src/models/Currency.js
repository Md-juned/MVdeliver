import { TableNames } from "../common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Currency = sequelize.define(
    "Currency",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      country_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      rate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1,
      },
      currency_position: {
        type: DataTypes.ENUM(
          "before_price",
          "before_price_with_space",
          "after_price",
          "after_price_with_space"
        ),
        allowNull: false,
        defaultValue: "before_price",
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
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
      tableName: TableNames.currencies,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Currency;
};

