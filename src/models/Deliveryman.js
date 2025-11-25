import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Deliveryman = sequelize.define(
    "Deliveryman",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      image: {
        type: DataTypes.STRING(500),
        allowNull: true,
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
      tableName: TableNames.deliverymen,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Deliveryman;
};

