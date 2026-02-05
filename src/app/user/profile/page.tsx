import { getCompanyByUserId } from '@/app/admin/profile/_services/profileUpdate.action';
import { auth } from '@/app/auth/_services/auth';
import ProfileComp from '@/components/ProfileForBoth/ProfileComp';
import { getUserByIdWithRelations } from '@/lib/utils-functions/getUserById';

export const dynamic = 'force-dynamic';

async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const [userProfileData, companyData] = await Promise.all([
    getUserByIdWithRelations(session.user.id),
    getCompanyByUserId(session.user.id),
  ]);

  return (
    <div>
      <ProfileComp
        profileDataDefaulValues={{
          name: userProfileData?.name ?? undefined,
          country: userProfileData?.country ?? undefined,
          language: userProfileData?.language ?? undefined,
          lastName: userProfileData?.lastName ?? undefined,
          phone: userProfileData?.phone ?? undefined,
          image: userProfileData?.image ?? undefined,
        }}
        companyDataDefaulValues={{
          companyName: companyData?.companyName ?? undefined,
          companyDescription: companyData?.companyDescription ?? undefined,
          companyIndustry: companyData?.companyIndustry ?? undefined,
          companyNumber: companyData?.companyNumber ?? undefined,
          companyWebsite: companyData?.companyWebsite ?? undefined,
        }}
      />
    </div>
  );
}

export default ProfilePage;
