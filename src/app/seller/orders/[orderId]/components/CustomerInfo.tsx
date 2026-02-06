import { User, Phone, MapPin, Mail } from 'lucide-react';

interface CustomerInfoProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export function CustomerInfo({ customerName, customerEmail, customerPhone }: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Customer Information
      </h3>
      <div className="space-y-3 text-sm">
        {customerName && (
          <div>
            <label className="text-xs text-gray-500">Name</label>
            <p className="font-medium text-gray-900">{customerName}</p>
          </div>
        )}
        {customerEmail && (
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <p className="font-medium text-gray-900">{customerEmail}</p>
          </div>
        )}
        {customerPhone && (
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Phone
            </label>
            <p className="font-medium text-gray-900">{customerPhone}</p>
          </div>
        )}
      </div>
    </div>
  );
}
