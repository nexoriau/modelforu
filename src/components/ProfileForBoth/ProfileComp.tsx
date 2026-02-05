'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// 🚀 Import useTranslation
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Bell, Building, Camera, Pencil, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { profileSchema, UserProfileUpdateType } from '@/db/schema/auth';
import { companySchema, CompanyUpdateType } from '@/db/schema/company';
import Image from 'next/image';
import { toast } from 'sonner';
import { profileUpdate } from '@/app/admin/profile/_services/profileUpdate.action';
import { uploadToCloudinary } from '@/lib/utils-functions/uploadToCloudinary';
import { QueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Label } from '../ui/label';
import Link from 'next/link';

type Props = {
  profileDataDefaulValues: UserProfileUpdateType;
  companyDataDefaulValues: CompanyUpdateType;
};

export default function ProfileComp({
  companyDataDefaulValues,
  profileDataDefaulValues,
}: Props) {
  // 🚀 Initialize translation hook
  const { t } = useTranslation();

  const { currentUser } = useAuth();
  const queryClient = new QueryClient();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    profileDataDefaulValues.image || null
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileForm = useForm({
    mode: 'onChange',
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...{
        name: '',
        lastName: '',
        phone: '',
        country: '',
        language: '',
      },
      ...profileDataDefaulValues,
    },
  });

  const companyForm = useForm({
    mode: 'onChange',
    resolver: zodResolver(companySchema),
    defaultValues: {
      ...{
        companyName: '',
        companyWebsite: '',
        companyDescription: '',
        companyIndustry: '',
        companyNumber: '',
      },
      ...companyDataDefaulValues,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const profileValid = await profileForm.trigger();
    const companyValid = await companyForm.trigger();

    if (!profileValid || !companyValid) {
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl: string | null | undefined =
      profileDataDefaulValues.image;

    try {
      if (profileFile) {
        uploadedImageUrl = await uploadToCloudinary(profileFile);
      }

      const profileData = profileForm.getValues();
      const companyData = companyForm.getValues();

      const res = await profileUpdate({
        userProfileData: {
          ...profileData,
          image: uploadedImageUrl ?? undefined,
        },
        companyData,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ['users', currentUser?.id],
      });
      // 🚀 Use translation key for success toast
      toast.success(t('profile.toasts.success'));
    } catch (error) {
      console.error('Error saving changes:', error);
      if (!(error as Error).message.includes('Cloudinary')) {
        // 🚀 Use translation key for error toast
        toast.error(t('profile.toasts.error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 sm:p-10">
      <div className="flex flex-col items-center mb-10">
        {/* Profile Image Section */}
        <div className="relative mb-4 group">
          <div className="w-32 h-32 rounded-full relative bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white">
            {profileImagePreview ? (
              <Image
                fill
                src={profileImagePreview}
                alt="Profile"
                className="object-cover transition-opacity absolute duration-300 group-hover:opacity-80"
              />
            ) : (
              <Camera className="w-10 h-10 text-gray-500" />
            )}
          </div>
          <label
            htmlFor="profile-upload"
            title="Change profile picture"
            className="absolute inset-0 rounded-full cursor-pointer opacity-0 group-hover:opacity-60 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-300"
          >
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              multiple={false}
              className="hidden"
              onChange={handleImageUpload}
            />
            <Pencil className="w-6 h-6 text-white" />
          </label>
        </div>

        {/* Profile Name and Subtitle */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {profileDataDefaulValues.name}
        </h1>
        <p className="text-md text-gray-500">{t('profile.header.subtitle')}</p>
      </div>

      {/* Notification Preference Button - New Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-200">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-gray-700 mr-3" />
          <p className="text-lg font-medium text-gray-900">
            {t('profile.notificationPreferences')}
          </p>
        </div>
        <Button
          variant="outline"
          className="text-sm border-gray-300 hover:bg-gray-100"
        >
          <Link href={'/user/notification-management'}>
            {t('profile.notificationPreferences')}
          </Link>
        </Button>
      </div>

      {/* Profile Information Section */}
      <div className="mb-10 pt-4 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="w-5 h-5 mr-2" />
          {t('profile.profileInfo.title')}
        </h2>

        <Form {...profileForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.profileInfo.fields.firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'profile.profileInfo.placeholders.firstName'
                        )}
                        className="bg-gray-100 border-gray-300 focus-visible:ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.profileInfo.fields.lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'profile.profileInfo.placeholders.lastName'
                        )}
                        className="bg-gray-100 border-gray-300 focus-visible:ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.profileInfo.fields.phone')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'profile.profileInfo.placeholders.phone'
                        )}
                        className="bg-gray-100 border-gray-300 focus-visible:ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.profileInfo.fields.country')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-gray-100 border-gray-300 focus-visible:ring">
                          <SelectValue
                            placeholder={t(
                              'profile.profileInfo.placeholders.country'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="us">
                          {t('profile.profileInfo.countryOptions.us')}
                        </SelectItem>
                        <SelectItem value="uk">
                          {t('profile.profileInfo.countryOptions.uk')}
                        </SelectItem>
                        <SelectItem value="ca">
                          {t('profile.profileInfo.countryOptions.ca')}
                        </SelectItem>
                        <SelectItem value="au">
                          {t('profile.profileInfo.countryOptions.au')}
                        </SelectItem>
                        <SelectItem value="pk">
                          {t('profile.profileInfo.countryOptions.pk')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={profileForm.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.profileInfo.fields.languages')}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-gray-100 border-gray-300 focus-visible:ring">
                          <SelectValue
                            placeholder={t(
                              'profile.profileInfo.placeholders.languages'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="english">
                          {t('profile.profileInfo.languageOptions.english')}
                        </SelectItem>
                        <SelectItem value="spanish">
                          {t('profile.profileInfo.languageOptions.spanish')}
                        </SelectItem>
                        <SelectItem value="french">
                          {t('profile.profileInfo.languageOptions.french')}
                        </SelectItem>
                        <SelectItem value="german">
                          {t('profile.profileInfo.languageOptions.german')}
                        </SelectItem>
                        <SelectItem value="urdu">
                          {t('profile.profileInfo.languageOptions.urdu')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {t('profile.profileInfo.fields.email')}
                </Label>
                <Input
                  readOnly
                  value={currentUser?.email ?? ''}
                  className="bg-gray-200 border-gray-300 opacity-90 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </Form>
      </div>

      <hr className="mb-10 border-gray-200" />

      {/* Company Details Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          {t('profile.companyDetails.title')}
        </h2>

        <Form {...companyForm}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={companyForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.companyDetails.fields.companyName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'profile.companyDetails.placeholders.companyName'
                        )}
                        className="bg-gray-100 border-gray-300 focus-visible:ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={companyForm.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t('profile.companyDetails.fields.companyWebsite')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'profile.companyDetails.placeholders.companyWebsite'
                        )}
                        className="bg-gray-100 border-gray-300 focus-visible:ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={companyForm.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-sm font-medium">
                      {t('profile.companyDetails.fields.companyDescription')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'profile.companyDetails.placeholders.companyDescription'
                        )}
                        className="bg-gray-100 border-gray-300 resize-none focus-visible:ring min-h-20"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-6">
                <FormField
                  control={companyForm.control}
                  name="companyIndustry"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium">
                        {t('profile.companyDetails.fields.companyIndustry')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-gray-100 border-gray-300 focus-visible:ring">
                            <SelectValue
                              placeholder={t(
                                'profile.companyDetails.placeholders.companyIndustry'
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">
                            {t(
                              'profile.companyDetails.industryOptions.technology'
                            )}
                          </SelectItem>
                          <SelectItem value="finance">
                            {t(
                              'profile.companyDetails.industryOptions.finance'
                            )}
                          </SelectItem>
                          <SelectItem value="healthcare">
                            {t(
                              'profile.companyDetails.industryOptions.healthcare'
                            )}
                          </SelectItem>
                          <SelectItem value="retail">
                            {t('profile.companyDetails.industryOptions.retail')}
                          </SelectItem>
                          <SelectItem value="manufacturing">
                            {t(
                              'profile.companyDetails.industryOptions.manufacturing'
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="companyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t('profile.companyDetails.fields.companyNumber')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'profile.companyDetails.placeholders.companyNumber'
                          )}
                          className="bg-gray-100 border-gray-300 focus-visible:ring"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </Form>
      </div>

      {/* Save Button */}
      <div className="mt-10 pt-6 border-t border-gray-200 text-center">
        <Button onClick={handleSaveChanges} disabled={isSubmitting} size={'lg'}>
          {isSubmitting
            ? t('profile.buttons.saving')
            : t('profile.buttons.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
