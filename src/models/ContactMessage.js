import { TableNames } from "../../src/common/constant/dbConstants.js";

export default (sequelize, DataTypes) => {
  const ContactMessage = sequelize.define(
    "ContactMessage",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: TableNames.users, key: "id" },
        onDelete: "SET NULL",
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING(50), allowNull: true },
      subject: { type: DataTypes.STRING(255), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "resolved"),
        allowNull: false,
        defaultValue: "pending",
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: TableNames.contact_messages,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ContactMessage.associate = (models) => {
    ContactMessage.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return ContactMessage;
};

