// ts
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MostReplayedData {
    startMillis: number;
    intensityScoreNormalized: number;
}

interface PlayerProps {
    videoId: string | undefined;
    currentTime: number;
    onCurrentTimeChange: (time: number) => void;
    isLocked: boolean;
    setIsLocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Player({
    videoId,
    currentTime,
    onCurrentTimeChange,
    isLocked,
    setIsLocked
}: PlayerProps) {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [mostReplayedData, setMostReplayedData] = useState<
        MostReplayedData[]
    >([]);

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        playerRef.current = event.target;
        event.target?.pauseVideo();
    };

    useEffect(() => {
        const fetchMostReplayedData = async () => {
            if (videoId) {
                try {
                    const response = await axios.get(
                        `http://127.0.0.1:5000/api/most-replayed?videoId=${videoId}`
                    );
                    const data = response.data;
                    setMostReplayedData(data);
                } catch (error) {
                    console.error('Error fetching most replayed data:', error);
                }
            }
        };

        fetchMostReplayedData();
    }, [videoId]);

    useEffect(() => {
        const updateCurrentTime = async () => {
            if (playerRef.current) {
                const time = await playerRef.current.getCurrentTime();
                onCurrentTimeChange(time);
            }
        };

        const intervalId = setInterval(updateCurrentTime, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, [onCurrentTimeChange]);

    useEffect(() => {
        if (isLocked && playerRef.current) {
            if (currentTime < startTime!) {
                playerRef.current.seekTo(startTime!, true);
            } else if (currentTime > startTime! + 10) {
                playerRef.current.seekTo(startTime!, true);
            }
        }
    }, [currentTime, startTime, isLocked]);

    const handleLockClick = () => {
        setStartTime(currentTime);
        setIsLocked(!isLocked);
    };

    const [hours, minutes, seconds, milliseconds] = useMemo(() => {
        const totalSeconds = Math.floor(startTime ?? 0);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor(
            ((startTime ?? 0) - totalSeconds) * 1000
        );
        return [hours, minutes, seconds, milliseconds];
    }, [startTime]);

    const opts: YouTubeProps['opts'] = {
        height: '480',
        width: '854',
        playerVars: {
            autoplay: 1
        }
    };

    return (
        <div className="flex flex-col items-center">
            <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} />
            <ResponsiveContainer width="100%" height={100}>
                <LineChart compact={true} data={mostReplayedData}>
                    <Line
                        type="monotone"
                        dot={false}
                        dataKey="intensityScoreNormalized"
                        stroke="#ff7300"
                        yAxisId={0}
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="my-4 py-2 px-4 shadow-xl border-2 border-gray-100 rounded-full whitespace-nowrap flex">
                <p className="flex items-center mr-4">
                    {'Clip Start Time:'}&nbsp;
                    <b>
                        {hours.toString().padStart(2, '0')}:
                        {minutes.toString().padStart(2, '0')}:
                        {seconds.toString().padStart(2, '0')}:
                        {milliseconds.toString().padStart(3, '0')}
                    </b>
                </p>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-full"
                    onClick={handleLockClick}
                >
                    {isLocked ? 'Locked' : 'Unlocked'}
                </button>
            </div>
        </div>
    );
}
