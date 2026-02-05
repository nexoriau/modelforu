'use client';
// 🚀 Import useTranslation
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserTableType } from '@/db/schema/auth';
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import { Bot, Coins, Users } from 'lucide-react';
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';

// Define the type for the translation function for clarity
type TFunction = ReturnType<typeof useTranslation>['t'];

type Props = {
  filteredUsers: UserTableType[];
};

function UsersPageTable({ filteredUsers }: Props) {
  // 🚀 Initialize translation hook
  const { t } = useTranslation();

  if (!filteredUsers || filteredUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Users className="h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">
          {/* 🚀 Use translation key */}
          {t('admin.usersManagement.table.emptyState.title')}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {/* 🚀 Use translation key */}
          {t('admin.usersManagement.table.emptyState.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border mt-3 overflow-x-auto w-[280px] sm:w-[350px] md:w-full">
      <Table className="w-full">
        <TableHeader className="bg-gray-100">
          <TableRow>
            {/* 🚀 Use translation keys for Table Headers */}
            <TableHead className="w-[100px]">
              {t('admin.usersManagement.table.header.username')}
            </TableHead>
            <TableHead>
              {t('admin.usersManagement.table.header.email')}
            </TableHead>
            <TableHead>
              {t('admin.usersManagement.table.header.status')}
            </TableHead>
            <TableHead>
              {t('admin.usersManagement.table.header.role')}
            </TableHead>
            <TableHead>
              {t('admin.usersManagement.table.header.tokensRemaining')}
            </TableHead>
            <TableHead>
              {t('admin.usersManagement.table.header.modelsRemaining')}
            </TableHead>
            <TableHead>
              {t('admin.usersManagement.table.header.createdAt')}
            </TableHead>
            <TableHead className="text-right">
              {t('admin.usersManagement.table.header.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            // Pass t function down to the row component
            <UsersTableRow user={user} key={user.id} t={t} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default UsersPageTable;

// Update props to accept the translation function 't'
function UsersTableRow({ user, t }: { user: UserTableType; t: TFunction }) {
  // Helper function to capitalize first letter for AvatarFallback
  const initial = user.name?.charAt(0).toUpperCase() || 'U';

  return (
    <TableRow key={user.email}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {user.image ? (
              <AvatarImage src={user.image} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {initial}
              </AvatarFallback>
            )}
          </Avatar>
          {user.name}
        </div>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full uppercase text-xs ${
            user.status === 'approved'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : user.status === 'blocked'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-800 border border-gray-300'
          }`}
        >
          {user.status}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full uppercase text-xs ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : user.role === 'user'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-cyan-100 text-cyan-800'
          }`}
        >
          {user.role}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span> {user.tokens}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Bot className="h-4 w-4 text-cyan-600" />
          <span> {user.models}</span>
        </div>
      </TableCell>
      <TableCell>
        {user.createdAt && dateFormatter(user.createdAt, 'DD-MMM-YYYY')}
      </TableCell>
      <TableCell className="text-right space-x-1">
        <EditUserDialog user={user} />
        <DeleteUserDialog userId={user.id} />
      </TableCell>
    </TableRow>
  );
}
