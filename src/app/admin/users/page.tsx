import React from 'react';
import UsersPageComp from './_components/UsersPageComp';
import { getAllUsers } from './_services/users.queries';

export const dynamic = 'force-dynamic';

async function UsersPage() {
  const allUsers = await getAllUsers();
  console.log(allUsers)
  return (
    <div>
      <UsersPageComp allUsers={allUsers} />
    </div>
  );
}

export default UsersPage;
