import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const AboutUsPage = sequelize.define(
    "AboutUsPage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "en",
        comment: "Language code (en, bn, etc.)",
      },
      about_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: "Rich text content",
      },
      experience_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      additional_data: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: "JSON string for additional fields like titles and descriptions",
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
      tableName: TableNames.aboutUsPages,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          unique: true,
          fields: ["language"],
          name: "unique_language",
        },
      ],
    }
  );

  return AboutUsPage;
};

