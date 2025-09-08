import bcrypt from "bcryptjs";

export async function up(queryInterface) {
  const hashedPassword = await bcrypt.hash("SuperAdmin@123", 12);

  await queryInterface.bulkInsert("users", [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "superadmin@ecommerce.com",
      password: hashedPassword,
      first_name: "Super",
      last_name: "Admin",
      role: "super_admin",
      is_active: true,
      is_email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("users", {
    email: "superadmin@ecommerce.com",
  });
}
