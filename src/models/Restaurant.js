import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const Restaurant = sequelize.define(
    "Restaurant",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // Basic Info
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      logo_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      cover_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      // City / Cuisine
      city_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      cuisine_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Contact & Address
      whatsapp_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      address: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },

      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },

      max_delivery_distance: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Owner Info
      owner_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      owner_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      owner_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      // Account Info
      account_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      account_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      account_password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // Other Info
      opening_time: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      closing_time: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      min_food_processing_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      max_food_processing_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      time_slot_seprated: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      tags: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      pickup_order: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      delivery_order: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      approval_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },

      is_trusted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // Timestamps
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
      tableName: TableNames.restaurants,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

    Restaurant.associate = (models) => {
      Restaurant.belongsTo(models.City, {
        foreignKey: "city_id",
        as: "city",
      });

      Restaurant.belongsTo(models.Cuisine, {
        foreignKey: "cuisine_id",
        as: "cuisine",
      });
    };


  return Restaurant;
};
