import clsx from 'clsx';
import React from 'react';

interface ExportButtonProps {
    onExport: () => void;
    disabled: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    onExport,
    disabled
}) => {
    return (
        <button
            className={clsx(
                'm-4 rounded-full bg-blue-500 px-4 py-2 text-white',
                disabled
                    ? 'bg-gray-200'
                    : 'hover:bg-blue-300 active:bg-blue-600'
            )}
            onClick={onExport}
            disabled={disabled}
        >
            Export
        </button>
    );
};
