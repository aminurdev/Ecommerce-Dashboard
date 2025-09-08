export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM("super_admin", "admin", "manager", "user"),
      defaultValue: "user",
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    is_email_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    email_verification_token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    password_reset_token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    password_reset_expires: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    google_id: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    two_factor_secret: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    two_factor_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    last_login: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  // Add indexes
  await queryInterface.addIndex("users", ["email"]);
  await queryInterface.addIndex("users", ["role"]);
  await queryInterface.addIndex("users", ["is_active"]);
  await queryInterface.addIndex("users", ["google_id"]);
}

export async function down(queryInterface) {
  await queryInterface.dropTable("users");
}
