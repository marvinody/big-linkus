import Sequelize from "sequelize";
import db from "./db";

export const User = db.define("user", {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  channelId: {
    type: Sequelize.STRING,
    unique: true,
  },
});

export const AccessToken = db.define("accessToken", {
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expires: {
    type: Sequelize.DATE,
  },
});

// refresh token should be encrypted at some point...
export const RefreshToken = db.define("refreshToken", {
  token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export const Broadcast = db.define("broadcast", {
  ytId: {
    type: Sequelize.STRING,
    unique: true,
  },
  status: {
    type: Sequelize.ENUM(
      "created",
      "live",
      "liveStarting",
      "ready",
      "revoked",
      "testStarting",
      "testing",
      "complete"
    ),
  },
});

User.hasMany(Broadcast);
Broadcast.belongsTo(User);

User.hasMany(AccessToken);
AccessToken.belongsTo(User);

User.hasMany(RefreshToken);
RefreshToken.belongsTo(User);
