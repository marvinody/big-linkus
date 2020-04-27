import Sequelize from "sequelize";
import db from "./db";

export const Repo = db.define("repos", {
  user: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

export const Email = db.define("emails", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Repo.belongsToMany(Email, { through: "RepoEmails" });
Email.belongsToMany(Repo, { through: "RepoEmails" });
