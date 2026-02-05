'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input'; // Import Input
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import {
  Bot,
  FileText,
  GitPullRequest,
  Hourglass,
  Video,
  Search,
  Save,
  SendHorizonal,
  LucideLoader2,
} from 'lucide-react';
import { SubModelTableType, SubMoelsWithModelType } from '@/db/schema/sub-model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useMemo } from 'react'; // Import useMemo
import { updateSubModel } from '@/app/user/my-models/_services/sub-model/subModel.actions';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateModel } from '@/app/user/my-models/_services/main-model/mainMode.actions';
import { apikeys } from 'googleapis/build/src/apis/apikeys';

// Define the available static options
const statusOptions: SubModelTableType['status'][] = [
  'pending',
  'cloning',
  'cloned',
  'canceled',
  'idle',
];
const typeOptions: SubModelTableType['type'][] = ['audio', 'video', 'photo'];

type Props = {
  allSubModels: SubMoelsWithModelType[];
};

function SubModelsRequestsTable({ allSubModels }: Props) {
  // --- State for Filters ---
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [driveLinkSearch, setDriveLinkSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Empty string means "All"
  const [typeFilter, setTypeFilter] = useState(''); // Empty string means "All"

  // --- Filtering Logic ---
  const filteredModels = useMemo(() => {
    return allSubModels.filter((subModel) => {
      const matchesDescription = subModel.description
        ?.toLowerCase()
        .includes(descriptionSearch.toLowerCase());

      const matchesDriveLink = subModel.driveLink
        ?.toLowerCase()
        .includes(driveLinkSearch.toLowerCase());

      const matchesStatus =
        statusFilter && statusFilter !== 'all'
          ? subModel.status === statusFilter
          : true;
      const matchesType =
        typeFilter && typeFilter !== 'all'
          ? subModel.type === typeFilter
          : true;

      return (
        matchesDescription && matchesDriveLink && matchesStatus && matchesType
      );
    });
  }, [
    allSubModels,
    descriptionSearch,
    driveLinkSearch,
    statusFilter,
    typeFilter,
  ]);

  // --- Empty State Check ---
  if (!allSubModels || allSubModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <GitPullRequest className="h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">
          No Sub-Model Requests Found
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          There are no sub-model creation requests to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-4xl my-3">Sub Models Request Table</h1>
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-t-md bg-white">
        {/* Description Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Description..."
            value={descriptionSearch}
            onChange={(e) => setDescriptionSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Drive Link Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Drive Link..."
            value={driveLinkSearch}
            onChange={(e) => setDriveLinkSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter Dropdown */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter Dropdown */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-b-md border overflow-x-auto w-[280px] sm:w-[350px] md:w-full">
        <Table className="w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-[100px]">S.No</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead className="text-left">Drive Link</TableHead>
             
             <TableHead className="text-left">Character Key</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Display message if no results after filtering */}
            {filteredModels.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  No requests match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredModels.map((subModel, ind) => (
                <SubModelsTableRow
                  subModel={subModel}
                  index={ind}
                  key={subModel.id}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SubModelsRequestsTable;

function SubModelsTableRow({
  subModel,
  index,
}: {
  subModel: SubMoelsWithModelType;
  index: number;
}) {
  const [subModelStatus, setSubModelStatus] = useState(subModel.status);
  const [apiKey, setApiKey] = useState(subModel.model.character ?? '');
  const [isLoading, setIsLoading] = useState(false);

  // Define helper functions outside of render for optimization/clarity
  const getStatusStyle = (status: SubModelTableType['status']) => {
    // ... (rest of the getStatusStyle implementation remains the same)
    switch (status) {
      case 'cloned':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'cloning':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'canceled':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'idle':
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getTypeIcon = (type: SubModelTableType['type']) => {
    // ... (rest of the getTypeIcon implementation remains the same)
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'audio':
        return <Bot className="h-4 w-4 text-cyan-600" />;
      case 'photo':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <Hourglass className="h-4 w-4 text-gray-500" />;
    }
  };

  // Status update handler
  const handleStatusChange = async (newStatus: SubModelTableType['status']) => {
    setSubModelStatus(newStatus);
    // Assuming updateSubModel is correctly imported and works as an async action
    await updateSubModel(subModel.id, { status: newStatus });
  };

  const saveApiKey = async () => {
    try {
      setIsLoading(true);
      await updateModel(subModel.modelId, { ...subModel.model,character: apiKey });
      toast.success('API KEY added');
    } catch (error) {
      console.log(error);
      toast.error('Error while assinging API KEY');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TableRow key={subModel.id}>
      <TableCell className="font-medium max-w-[100px] overflow-hidden text-ellipsis">
        {index + 1}
      </TableCell>
      <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
        {subModel.description}
      </TableCell>
      <TableCell>
        {/* Status Dropdown - Allows admin/user to change status */}
        <Select
          value={subModelStatus}
          onValueChange={(e) =>
            handleStatusChange(e as SubModelTableType['status'])
          }
        >
          <SelectTrigger className="w-full">
            {/* Display the selected status with its badge style */}
            <SelectValue asChild>
              <span
                className={`px-2 py-1 rounded-full uppercase text-xs font-medium ${getStatusStyle(subModelStatus)}`}
              >
                {subModelStatus}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((v) => (
              <SelectItem key={v} value={v}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {/* Type Display - remains static */}
        <div className="flex items-center gap-2">
          {getTypeIcon(subModel.type)}
          <span className="uppercase text-xs font-medium">{subModel.type}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono">{subModel.itemsLength}</span>
      </TableCell>
      <TableCell>
        {subModel.createdAt &&
          dateFormatter(subModel.createdAt, 'DD-MMM-YYYY hh:mm a')}
      </TableCell>
      <TableCell className="text-left text-xs max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
        {subModel.driveLink ? (
          <Link
            target="_blank"
            href={subModel.driveLink}
            className="text-blue-500 hover:text-blue-600 hover:underline hover:underline-offset-2"
          >
            {/* Display truncated link text or a placeholder */}
            {subModel.driveLink.length > 30
              ? `${subModel.driveLink.substring(0, 30)}...`
              : subModel.driveLink}
          </Link>
        ) : (
          '-'
        )}
      </TableCell>
      {/* {subModel.type==='photo' &&( */}
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <Input
            value={apiKey}
            disabled={isLoading || !(subModel.type==='photo')}
            onChange={(e) => {
              setApiKey(e.target.value);
            }}
            className="w-52 font-mono text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveApiKey();
              }
            }}
          />
          <Button
            size={'icon-sm'}
            onClick={saveApiKey}
            disabled={isLoading || !apiKey.trim().length || !(subModel.type==='photo') || subModel.model.character===apiKey.trim()}
          >
            {isLoading ? (
              <LucideLoader2 className="animate-spin" />
            ) : (
              <SendHorizonal />
            )}
          </Button>
        </div>
      </TableCell>
      {/* )} */}
    </TableRow>
  );
}
