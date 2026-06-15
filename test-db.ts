import { db } from './src/db/index';
import { usersTable } from './src/db/schema/users.schema';
async function test() {
  const users = await db.query.usersTable.findMany({
    with: { role: { with: { rolePermissions: { with: { permission: true } } } } }
  });
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}
test();
