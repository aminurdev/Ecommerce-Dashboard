export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("refresh_tokens", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
  await queryInterface.addIndex("refresh_tokens", ["user_id"]);
  await queryInterface.addIndex("refresh_tokens", ["expires_at"]);
  await queryInterface.addIndex("refresh_tokens", ["is_active"]);
}

export async function down(queryInterface) {
  await queryInterface.dropTable("refresh_tokens");
}
