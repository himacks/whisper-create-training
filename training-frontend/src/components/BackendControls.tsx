import React from 'react';
import { API_URL } from '../utils';

const BackendControls: React.FC = () => {
    const handlePurgeTable = async () => {
        try {
            const response = await fetch(`${API_URL}/api/purge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Table purged successfully');
            } else {
                console.error('Error purging table:', response.statusText);
            }
        } catch (error) {
            console.error('Error purging table:', error);
        }
    };

    const handleProcessTable = async () => {
        try {
            const response = await fetch(`${API_URL}/api/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Table processed successfully');
            } else {
                console.error('Error processing table:', response.statusText);
            }
        } catch (error) {
            console.error('Error processing table:', error);
        }
    };

    const handleExportJSON = async () => {
        try {
            const response = await fetch(`${API_URL}/api/jsonexport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('JSON Table exported successfully');
            } else {
                console.error('Error exporting JSON table:', response.statusText);
            }
        } catch (error) {
            console.error('Error exporting JSON table:', error);
        }
    };


    return (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Backend Controls</h2>
            <div className="space-x-4">
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    onClick={handlePurgeTable}
                >
                    Purge Table
                </button>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={handleProcessTable}
                >
                    Process Table
                </button>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={handleExportJSON}
                >
                    Export JSON
                </button>
            </div>
        </div>
    );
};

export default BackendControls;
