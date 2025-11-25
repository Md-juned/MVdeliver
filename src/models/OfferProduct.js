import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const OfferProduct = sequelize.define(
    "OfferProduct",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      offer_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
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
      tableName: TableNames.offerProducts,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  OfferProduct.associate = (models) => {
    OfferProduct.belongsTo(models.Offer, {
      foreignKey: "offer_id",
      as: "offer",
    });
    OfferProduct.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return OfferProduct;
};

