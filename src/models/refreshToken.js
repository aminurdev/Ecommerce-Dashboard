import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "refresh_tokens",
  }
);

RefreshToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(RefreshToken, { foreignKey: "user_id" });

export default RefreshToken;
