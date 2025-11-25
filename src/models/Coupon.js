import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
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

      code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      expired_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      min_purchase_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      discount_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "amount",
      },

      discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
    },
    {
      tableName: TableNames.coupons,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Coupon;
};

