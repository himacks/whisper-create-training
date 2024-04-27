import React, { useState, useEffect, SetStateAction } from 'react';
import { AudioSet } from '../utils';

interface AudioSetsSelectProps {
  audioSets: { [key: string]: AudioSet };
  selectedSets: string[];
  setSelectedSets: React.Dispatch<SetStateAction<string[]>>
}

export const AudioSetsSelect: React.FC<AudioSetsSelectProps> = ({
  audioSets,
  selectedSets,
  setSelectedSets
}) => {

  const handleSelect = (set: AudioSet) => {
    const isSelected = selectedSets.includes(set.id);

    if (isSelected) {
      setSelectedSets(selectedSets.filter((selectedId) => selectedId !== set.id));
    } else {
      setSelectedSets([...selectedSets, set.id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {Object.values(audioSets).map((set) => (
          <div
            key={set.id}
            className={`cursor-pointer rounded-full px-4 py-2 border-2 shadow-xl ${
              selectedSets.includes(set.id)
                ? 'bg-blue-500 text-white border-blue-300'
                : 'border-gray-100'
            }`}
            onClick={() => handleSelect(set)}
          >
            {set.displayName}
          </div>
        ))}
      </div>
    </div>
  );
};