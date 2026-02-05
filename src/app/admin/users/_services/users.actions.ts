"use server";

import { db } from "@/db";
import { subscriptionHistoryTable, usersTable } from "@/db/schema";
import { UserFormType } from "@/db/schema/auth";
import { hashPassword } from "@/lib/utils-functions/hashPassword";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCompanyByUserId } from "../../profile/_services/profileUpdate.action";

export const deleteUser = async (userId: string) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    revalidatePath("/admin/users");
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async (formData: UserFormType) => {
  try {
    if (!formData.email || !formData.password) {
      return { error: "Email and password are required" };
    }

    const { hashedPassword } = await hashPassword(formData.password);

    const insertData = {
      name: formData.name,
      email: formData.email,
      password: hashedPassword,
      role: formData.role ?? "user",
      status: formData.status,
      tokens: String(formData.tokens ?? 30),
      totalTokens: String(formData.tokens ?? 30),
      models: formData.models ?? 0,
      emailVerified: new Date(),
    };

    const [res] = await db
      .insert(usersTable)
      .values(insertData)
      .returning({ id: usersTable.id });

    if (!res?.id) {
      return { error: "User not created" };
    }

    revalidatePath("/admin/users");
    return { id: res.id };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong while creating user" };
  }
};

export const editUser = async ({
  formData,
  userId,
}: {
  formData: UserFormType;
  userId: string;
}) => {
  try {
    const updatedData = { ...formData };
    if (formData.password) {
      const { hashedPassword } = await hashPassword(formData.password);
      updatedData.password = hashedPassword;
    } else {
      delete updatedData.password;
    }
    const [res] = await db
      .update(usersTable)
      .set({
        ...updatedData,
        tokens: sql`${updatedData.tokens}`,
        models: sql`${updatedData.models}`,
      })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (!res.id) {
      return { error: "User not udpated" };
    }

    const companyData = await getCompanyByUserId(userId);

    const creditsData = {
      userId: userId,
      userEmail: updatedData.email || "",
      subscriptionId: `admin-${Date.now()}`,
      source: "admin-provided",
      type: "Admin Provided",
      description: "Admin Provided",
      tokenQuantity: Number(updatedData.tokens) || 0,
      price: "0.00", // String format for numeric
      invoiceUrl: "",
      invoiceId: `admin-invoice-${Date.now()}`,
      createdDate: new Date(),
      tokensExpireAt: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      companyName: companyData?.companyName || "",
      vatNumber: companyData?.companyNumber || "",
      companyAddress: companyData?.companyDescription || "",
    };
    revalidatePath("/admin/users");
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong while udpating user" };
  }
};
