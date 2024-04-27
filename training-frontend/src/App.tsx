import { ReactElement, useState } from 'react';
import { Player } from './components/YoutubePlayer';
import InputSearchBar from './components/UrlBox';
import { AudioSetsSelect } from './components/AudioSelect';
import { API_URL, AudioSets } from './utils';
import { ExportButton } from './components/ExportButton';
import BackendControls from './components/BackendControls';

function App(): ReactElement {
    const [videoId, setVideoId] = useState<string | undefined>();
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [selectedAudioSets, setSelectedAudioSets] = useState<string[]>([]);
    const [isLocked, setIsLocked] = useState(false);

    const handleReset = () => {
        setIsLocked(false);
        setSelectedAudioSets([]);
        setCurrentTime(currentTime);
    };

    const handleUrlSearch = (url: string) => {
        const regex = /v=([^&#]*)/; // Capture group 1: value between 'v=' and '&' or '#'
        if (regex.test(url)) {
            // Check if URL matches the regular expression
            const match = url.match(regex); // Get the matched group
            if (match && match[1]) {
                setVideoId(match[1]); // Set video ID to captured group (value between 'v=' and '&' or '#')
                setCurrentTime(0);
            }
        } else {
            console.log('Not a YouTube URL');
        }
    };

    const handleExport = async () => {
        if (!videoId || !isLocked) {
            return;
        }

        const exportObject = {
            videoId,
            start: currentTime,
            end: currentTime + 10,
            audioSets: selectedAudioSets
        };

        try {
            const response = await fetch(`${API_URL}/api/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exportObject)
            });

            if (response.ok) {
                console.log('Data exported successfully');
                handleReset();
            } else {
                console.error('Error exporting data:', response.statusText);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    return (
        <div className="m-20 flex flex-col items-center justify-center">
            <div className="p-10 border shadow-xl border-gray-50 rounded-xl flex flex-col items-center mb-20">
                <h2 className="text-2xl font-bold mb-4">Video Player</h2>
                <InputSearchBar callback={handleUrlSearch} />
                <Player
                    videoId={videoId}
                    isLocked={isLocked}
                    setIsLocked={setIsLocked}
                    currentTime={currentTime}
                    onCurrentTimeChange={setCurrentTime}
                />
                <AudioSetsSelect
                    audioSets={AudioSets}
                    selectedSets={selectedAudioSets}
                    setSelectedSets={setSelectedAudioSets}
                />
                <ExportButton
                    disabled={!videoId || !isLocked}
                    onExport={handleExport}
                />
            </div>
            <BackendControls />
        </div>
    );
}

export default App;
