import { TableNames } from "../../src/common/constant/dbConstants.js";

export default (sequelize, DataTypes) => {
  const ProductAddon = sequelize.define(
    "ProductAddon",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      addon_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
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
      tableName: TableNames.product_addons,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  ProductAddon.associate = (models) => {
    ProductAddon.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });

    ProductAddon.belongsTo(models.Addon, {
      foreignKey: "addon_id",
      as: "addon",
    });
  };

  return ProductAddon;
};
