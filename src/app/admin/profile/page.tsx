export const dynamic = 'force-dynamic';

import { auth } from '@/app/auth/_services/auth';
import ProfileComp from '@/components/ProfileForBoth/ProfileComp';
import { getUserByIdWithRelations } from '@/lib/utils-functions/getUserById';
import { getCompanyByUserId } from './_services/profileUpdate.action';

async function ProfilePage() {
  const session = await auth();
  const [userProfileData, companyData] = await Promise.all([
  getUserByIdWithRelations(session!.user.id),
  getCompanyByUserId(session!.user.id),
]);

  return (
    <div>
      <ProfileComp
        profileDataDefaulValues={{
          name: userProfileData?.name ?? '',
          country: userProfileData?.country ?? '',
          language: userProfileData?.language ?? '',
          lastName: userProfileData?.lastName ?? '',
          phone: userProfileData?.phone ?? '',
          image: userProfileData?.image ?? '',
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
