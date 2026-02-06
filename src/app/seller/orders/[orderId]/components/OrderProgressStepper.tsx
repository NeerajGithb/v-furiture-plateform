import { CheckCircle, Circle, XCircle } from 'lucide-react';

interface OrderProgressStepperProps {
  currentStatus: string;
}

export function OrderProgressStepper({ currentStatus }: OrderProgressStepperProps) {
  const steps = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = steps.findIndex(step => step.key === currentStatus);

  const getStepStatus = (index: number) => {
    if (isCancelled) return 'cancelled';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-600 border-emerald-600 text-white';
      case 'current':
        return 'bg-blue-600 border-blue-600 text-white';
      case 'cancelled':
        return 'bg-rose-600 border-rose-600 text-white';
      default:
        return 'bg-white border-gray-300 text-gray-400';
    }
  };

  const getLineColor = (index: number) => {
    if (isCancelled) return 'bg-rose-300';
    if (index < currentIndex) return 'bg-emerald-600';
    return 'bg-gray-200';
  };

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-rose-900">Order Cancelled</p>
            <p className="text-sm text-rose-700">This order has been cancelled and will not be processed</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 print:hidden">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">Order Progress</h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" style={{ zIndex: 0 }}>
          <div
            className={`h-full transition-all duration-500 bg-emerald-600`}
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between" style={{ zIndex: 1 }}>
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getStepColor(status)}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className={`w-5 h-5 ${isCurrent ? '' : 'fill-current'}`} />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">Current</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {currentStatus === 'pending' && '⏳ Waiting for confirmation'}
          {currentStatus === 'confirmed' && '✅ Order confirmed, ready to process'}
          {currentStatus === 'processing' && '📦 Order is being prepared'}
          {currentStatus === 'shipped' && '🚚 Package is on the way'}
          {currentStatus === 'delivered' && '🎉 Order successfully delivered'}
        </p>
      </div>
    </div>
  );
}
