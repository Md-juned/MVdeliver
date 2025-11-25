import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const CartAddon = sequelize.define(
    "CartAddon",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cart",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      addon_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: TableNames.addon,
          key: "id",
        },
        onDelete: "CASCADE",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "cart_addons",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  CartAddon.associate = (models) => {
    CartAddon.belongsTo(models.Cart, {
      foreignKey: "cart_id",
      as: "cart",
    });
    CartAddon.belongsTo(models.Addon, {
      foreignKey: "addon_id",
      as: "addon",
    });
  };

  return CartAddon;
};

