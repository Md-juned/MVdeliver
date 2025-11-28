import { TableNames } from "../../src/common/constant/dbConstants.js";

/**
 * @param { import("sequelize").Sequelize } sequelize
 * @param { import("sequelize").DataTypes } DataTypes
 */
export default (sequelize, DataTypes) => {
  const LoginPage = sequelize.define(
    "LoginPage",
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
      image_one: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      title_one: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description_one: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      image_two: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      title_two: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description_two: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      image_three: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      title_three: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description_three: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
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
      tableName: TableNames.loginPages,
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

  return LoginPage;
};

