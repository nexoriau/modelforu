'use server';

import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { UserProfileUpdateType, usersTable } from '@/db/schema/auth';
import { companyTable, CompanyUpdateType } from '@/db/schema/company';
import { getRouteRole } from '@/lib/utils-functions/getRouteRole';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const profileUpdate = async ({
  userProfileData,
  companyData,
}: {
  userProfileData: UserProfileUpdateType;
  companyData: CompanyUpdateType;
}) => {
  const session = await auth();
  const role = await getRouteRole();
  if (!session?.user) {
    return { error: 'User not found' };
  }
  try {
    await db
      .update(usersTable)
      .set(userProfileData)
      .where(eq(usersTable.id, session.user.id));

    await db
      .insert(companyTable)
      .values({ userId: session.user.id, ...companyData })
      .onConflictDoUpdate({ target: companyTable.userId, set: companyData });

    revalidatePath(`/${role}/profile`);
  } catch (error) {
    console.log(error);
    return { error: 'Error occurs while updating profile' };
  }
};

export const getCompanyByUserId = async (userId?: string) => {
  if (!userId) {
    return;
  }
  const company = await db.query.companyTable.findFirst({
    where: eq(companyTable.userId, userId),
  });

  return company;
};
