import { TableNames } from "../common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const DeliveryWithdrawRequest = sequelize.define(
    "DeliveryWithdrawRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      deliveryman_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      delivery_withdraw_method_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      withdraw_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      withdraw_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      bank_account_info: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      processed_at: {
        type: DataTypes.DATE,
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
      tableName: TableNames.deliveryWithdrawRequests,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  DeliveryWithdrawRequest.associate = (models) => {
    DeliveryWithdrawRequest.belongsTo(models.Deliveryman, {
      foreignKey: "deliveryman_id",
      as: "deliveryman",
    });
    DeliveryWithdrawRequest.belongsTo(models.DeliveryWithdrawMethod, {
      foreignKey: "delivery_withdraw_method_id",
      as: "delivery_withdraw_method",
    });
  };

  return DeliveryWithdrawRequest;
};


