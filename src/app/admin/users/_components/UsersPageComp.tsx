'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import CreateUserDialog from './CreateUserDialog';
import UsersPageTable from './UsersPageTable';
import { UserTableType } from '@/db/schema/auth';
import { useTranslation } from 'react-i18next';

type Props = {
  allUsers: UserTableType[];
};

export default function UsersPageComp({ allUsers }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const filteredUsers = useMemo(() => {
    return (
      allUsers?.filter((user) => {
        const filterByName = user.name
          ?.toLowerCase()
          .includes(text.toLowerCase());

        const filterByEmail = user.email
          .toLowerCase()
          .includes(text.toLowerCase());

        return filterByName || filterByEmail;
      }) || []
    );
  }, [text, allUsers]);

  return (
    <div className="max-w-[1070px] mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-2">
            <CardTitle className="text-2xl font-bold ">
              {t('admin.usersManagement.title')}
            </CardTitle>
            <CreateUserDialog />
          </div>
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.usersManagement.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="pl-10 pr-4 w-full md:w-fit py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardHeader>
        <CardContent>
          <UsersPageTable filteredUsers={filteredUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
