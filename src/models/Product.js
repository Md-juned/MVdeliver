import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      restaurant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      short_description: {
        type: DataTypes.TEXT, 
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      offer_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      is_featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      visibility: {
        type: DataTypes.ENUM("visible", "hidden"),
        allowNull: false,
        defaultValue: "visible",
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
      tableName: TableNames.product,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

    Product.associate = (models) => {
    Product.belongsTo(models.FoodCategory, { as: "foodCategory", foreignKey: "category_id" });
    Product.belongsTo(models.Restaurant, { as: "restaurant", foreignKey: "restaurant_id" });
    Product.hasMany(models.ProductSize, { as: "sizes", foreignKey: "product_id" });
    Product.hasMany(models.ProductSpecification, { as: "specifications", foreignKey: "product_id" });
    Product.hasMany(models.ProductAddon, { as: "addons", foreignKey: "product_id" });
    Product.hasMany(models.Favorite, { as: "favorites", foreignKey: "product_id" });
    };



  return Product;
};
