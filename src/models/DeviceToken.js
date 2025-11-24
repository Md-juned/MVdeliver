import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const DeviceToken = sequelize.define(
    "DeviceToken",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: TableNames.users,
          key: "id",
        },
        onDelete: "CASCADE",
      },
      fcm_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      device_token: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      device_type: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: TableNames.device_tokens,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return DeviceToken;
};
