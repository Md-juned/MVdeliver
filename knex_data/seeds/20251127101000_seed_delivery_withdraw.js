/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex("delivery_withdraw_requests").del();
  await knex("delivery_withdraw_methods").del();

  const now = new Date();

  await knex("delivery_withdraw_methods").insert([
    {
      name: "Delivery Wallet",
      minimum_amount: 20,
      maximum_amount: 200,
      withdraw_charge: 5,
      description: "Default delivery wallet withdrawal option",
      status: "active",
      created_at: now,
      updated_at: now,
    },
    {
      name: "Delivery Bank Transfer",
      minimum_amount: 50,
      maximum_amount: 500,
      withdraw_charge: 3.5,
      description: "Bank transfer for delivery partners",
      status: "active",
      created_at: now,
      updated_at: now,
    },
  ]);

  const methods = await knex("delivery_withdraw_methods")
    .select("id", "name")
    .orderBy("id", "asc");

  const deliveryman = await knex("deliverymen")
    .select("id")
    .orderBy("id", "asc")
    .first();

  if (!deliveryman || methods.length === 0) {
    return;
  }

  await knex("delivery_withdraw_requests").insert([
    {
      deliveryman_id: deliveryman.id,
      delivery_withdraw_method_id: methods[0].id,
      total_amount: 80,
      withdraw_amount: 76,
      withdraw_charge: 4,
      bank_account_info: "Wallet payout - delivery wallet",
      description: "Weekly payout via wallet",
      status: "approved",
      processed_at: now,
      created_at: now,
      updated_at: now,
    },
    {
      deliveryman_id: deliveryman.id,
      delivery_withdraw_method_id: methods[1]?.id ?? methods[0].id,
      total_amount: 120,
      withdraw_amount: 114,
      withdraw_charge: 6,
      bank_account_info: "Bank: TestBank, Acc: 123456789",
      description: "Monthly transfer via bank",
      status: "pending",
      created_at: now,
      updated_at: now,
    },
  ]);
}


