import { TableNames } from "../common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Setting = sequelize.define(
    "Setting",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      app_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Foodigo",
      },
      preloader: {
        type: DataTypes.ENUM("enable", "disable"),
        allowNull: false,
        defaultValue: "disable",
      },
      commission_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "commission",
      },
      seller_commission_per_delivery: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 2,
      },
      delivery_commission_per_delivery: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 2.5,
      },
      contact_message_receiver_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "admin@gmail.com",
      },
      timezone: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: "Asia/Dhaka",
      },
      per_kilometer_delivery_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 3,
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
      tableName: TableNames.settings,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Setting;
};


