import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const BulkOperationsModal = ({ 
  isOpen, 
  onClose, 
  selectedItems, 
  onConfirm, 
  operationType,
  isLoading = false 
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const getOperationDetails = () => {
    switch (operationType) {
      case 'delete':
        return {
          title: 'Delete Selected Items',
          description: `Are you sure you want to delete ${selectedItems.length} selected items? This action cannot be undone.`,
          confirmText: 'DELETE',
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-900/50',
          buttonColor: 'btn-danger'
        };
      case 'activate':
        return {
          title: 'Activate Selected Items',
          description: `This will activate ${selectedItems.length} selected items.`,
          confirmText: 'ACTIVATE',
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-900/50',
          buttonColor: 'btn-primary'
        };
      case 'deactivate':
        return {
          title: 'Deactivate Selected Items',
          description: `This will deactivate ${selectedItems.length} selected items.`,
          confirmText: 'DEACTIVATE',
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/50',
          buttonColor: 'btn-secondary'
        };
      case 'export':
        return {
          title: 'Export Selected Items',
          description: `This will export ${selectedItems.length} selected items to CSV format.`,
          confirmText: 'EXPORT',
          icon: CheckCircle,
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/50',
          buttonColor: 'btn-primary'
        };
      default:
        return {
          title: 'Bulk Operation',
          description: `This will perform the operation on ${selectedItems.length} selected items.`,
          confirmText: 'CONFIRM',
          icon: CheckCircle,
          color: 'text-primary-400',
          bgColor: 'bg-primary-900/50',
          buttonColor: 'btn-primary'
        };
    }
  };

  const details = getOperationDetails();
  const IconComponent = details.icon;

  const handleConfirm = () => {
    if (confirmText === details.confirmText) {
      onConfirm();
    }
  };

  const isConfirmValid = confirmText === details.confirmText;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-dark-900/80 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-dark-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-dark-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${details.bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
                <IconComponent className={`h-6 w-6 ${details.color}`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-white">
                  {details.title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-dark-300">
                    {details.description}
                  </p>
                </div>
                
                {operationType === 'delete' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="input w-full"
                      placeholder="DELETE"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-dark-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isLoading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${details.buttonColor}`}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                details.confirmText
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-dark-600 shadow-sm px-4 py-2 bg-dark-800 text-base font-medium text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsModal;
