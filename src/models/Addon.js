import { TableNames } from "../../src/common/constant/dbConstants.js";

export default (sequelize, DataTypes) => {
  const Addon = sequelize.define(
    "Addon",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      restaurant_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
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
      tableName: TableNames.addons,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  Addon.associate = (models) => {
    Addon.hasMany(models.ProductAddon, {
      foreignKey: "addon_id",
      as: "product_addons",
    });
  };

  return Addon;
};
