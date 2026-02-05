"use client";
// 🚀 Import useTranslation
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react"; // Added Loader2 for loading state
import { useForm } from "react-hook-form";
// import { VoiceSelector } from './VoiceSelector';
import { useState } from "react";
import { UserFormSchema, UserFormType, UserTableType } from "@/db/schema/auth";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type Props = {
  formSubmit: (formData: UserFormType) => void;
  isEdit?: boolean;
  defaultValues?: Partial<UserFormType>;
};

export function UserForm({ formSubmit, isEdit = false, defaultValues }: Props) {
  // 1. Initialize translation hook
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form
  const form = useForm<UserFormType>({
    resolver: zodResolver(UserFormSchema(isEdit)),
    defaultValues: {
      ...{
        name: "",
        email: "",
        password: isEdit ? undefined : "",
        role: "user",
        tokens: 0,
        models: 0,
        status: "approved",
        // guestUser: false,
        // haveVoices: 'all',
        // assignedVoices: [],
      },
      ...defaultValues,
    },
  });
  //   const watchHaveVoices = form.watch('haveVoices');
  // Handle form submission
  return (
    <div className="pt-4">
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setIsLoading(true);
              await form.handleSubmit(formSubmit)(e);
            } catch (error) {
              console.log(error);
            } finally {
              setIsLoading(false);
            }
          }}
          className="space-y-6"
        >
          <fieldset disabled={isLoading}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    {/* 🚀 Use translation key */}
                    <FormLabel>
                      {t("admin.usersManagement.form.fields.displayName.label")}
                    </FormLabel>
                    <FormControl>
                      {/* 🚀 Use translation key */}
                      <Input
                        placeholder={t(
                          "admin.usersManagement.form.fields.displayName.placeholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isEdit}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    {/* 🚀 Use translation key */}
                    <FormLabel>
                      {t("admin.usersManagement.form.fields.email.label")}
                    </FormLabel>
                    <FormControl>
                      {/* 🚀 Use translation key */}
                      <Input
                        placeholder={t(
                          "admin.usersManagement.form.fields.email.placeholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    {/* 🚀 Use translation key */}
                    <FormLabel>
                      {t("admin.usersManagement.form.fields.password.label")}
                    </FormLabel>
                    <FormControl>
                      {/* 🚀 Use translation key */}
                      <Input
                        type="password"
                        placeholder={t(
                          "admin.usersManagement.form.fields.password.placeholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    {/* 🚀 Use translation key */}
                    <FormLabel>
                      {t("admin.usersManagement.form.fields.role.label")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          {/* 🚀 Use translation key */}
                          <SelectValue
                            placeholder={t(
                              "admin.usersManagement.form.fields.role.placeholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="admin">
                          {t("admin.usersManagement.form.fields.role.admin")}
                        </SelectItem>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="user">
                          {t("admin.usersManagement.form.fields.role.user")}
                        </SelectItem>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="agency">
                          {t("admin.usersManagement.form.fields.role.agency")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    {/* 🚀 Use translation key */}
                    <FormLabel>
                      {t("admin.usersManagement.form.fields.status.label")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          {/* 🚀 Use translation key */}
                          <SelectValue
                            placeholder={t(
                              "admin.usersManagement.form.fields.status.placeholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="pending">
                          {t(
                            "admin.usersManagement.form.fields.status.pending"
                          )}
                        </SelectItem>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="approved">
                          {t(
                            "admin.usersManagement.form.fields.status.approved"
                          )}
                        </SelectItem>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="suspended">
                          {t(
                            "admin.usersManagement.form.fields.status.suspended"
                          )}
                        </SelectItem>
                        {/* 🚀 Use translation key */}
                        <SelectItem value="blocked">
                          {t(
                            "admin.usersManagement.form.fields.status.blocked"
                          )}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="tokens"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        {/* 🚀 Use translation key */}
                        <FormLabel>
                          {t("admin.usersManagement.form.fields.credits.label")}
                        </FormLabel>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 text-sm">
                            {/* 🚀 Use translation key */}
                            {t(
                              "admin.usersManagement.form.fields.credits.hoverContent"
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <FormControl>
                        {/* 🚀 Use translation key */}
                        {/* <Input
                          type="number"
                          placeholder={t(
                            'admin.usersManagement.form.fields.credits.placeholder'
                          )}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        /> */}
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder={t(
                            "admin.usersManagement.form.fields.credits.placeholder"
                          )}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Allow empty while typing
                            if (value === "") {
                              field.onChange("");
                              return;
                            }

                            const num = Number(value);

                            // Allow only positive numbers
                            if (num >= 0) {
                              field.onChange(num);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="models"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        {/* 🚀 Use translation key */}
                        <FormLabel>Models</FormLabel>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 text-sm">
                            Admins can only add bonus models. They cannot change
                            the amount of models originally purchased by the
                            user.
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <FormControl>
                        {/* 🚀 Use translation key */}
                        <Input
                          type="number"
                          placeholder={"Enter number of credits"}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Guest User Field - This field spans both columns */}
              {/* <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="guestUser"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>
                    Guest User
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div> */}

              {/* Have Voices Field - This field spans both columns */}
              {/* <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="haveVoices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Voices
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder="Select voices"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">
                      All
                    </SelectItem>
                    <SelectItem value="custom">
                      Custom
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

              {/* VoiceSelector - This field spans both columns when visible */}
              {/* {watchHaveVoices === 'custom' && (
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="assignedVoices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Assign Voices
                  </FormLabel>
                  <FormControl>
                    <VoiceSelector field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )} */}
            </div>

            {/* The submit button is outside the grid for a clean, full-width look */}
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {/* 🚀 Translate Submit Button based on isEdit prop */}
              {isLoading
                ? t("admin.usersManagement.form.buttons.loading")
                : isEdit
                  ? t("admin.usersManagement.form.buttons.submitEdit")
                  : t("admin.usersManagement.form.buttons.submitCreate")}
            </Button>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}
