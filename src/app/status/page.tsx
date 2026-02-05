import { XCircle, Clock, Check, PauseCircle } from 'lucide-react';
import { auth } from '../auth/_services/auth';
import StatusProtect from './StatusProtect';

async function StatusPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="h-5 bg-gray-300 rounded w-40"></div>
        </div>
      </div>
    );
  }

  const getStatusConfig = (
    status: 'pending' | 'approved' | 'suspended' | 'blocked'
  ) => {
    const configs = {
      pending: {
        icon: Clock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        label: 'Pending Review',
        description:
          "Your account is under review. We'll notify you once the verification process is complete.",
      },
      blocked: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Account Rejected',
        description:
          'Your account was not approved. Please contact support for more information.',
      },
      approved: {
        icon: Check,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Account Approved',
        description: 'Your account has been approved successfully.',
      },
      suspended: {
        icon: PauseCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Account Suspended',
        description:
          'Your account has been temporarily suspended. Please contact support to resolve this issue.',
      },
    };

    return configs[status];
  };

  const statusConfig = getStatusConfig(session.user.status);
  const StatusIcon = statusConfig.icon;

  return (
    <StatusProtect user={session.user}>
      <div className="flex items-center justify-center min-h-[74vh]">
        <div
          className={`flex items-start gap-4 max-w-lg w-full p-6 rounded-2xl border transition-all duration-200 shadow-xl ${statusConfig.bgColor} ${statusConfig.borderColor}`}
        >
          <StatusIcon
            className={`w-8 h-8 mt-1 shrink-0 ${statusConfig.color}`}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Account Status
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <p className="text-base text-gray-700 leading-relaxed">
              {statusConfig.description}
            </p>

            {session.user.email && (
              <p className="text-sm text-gray-500 mt-3 truncate">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </StatusProtect>
  );
}

export default StatusPage;
