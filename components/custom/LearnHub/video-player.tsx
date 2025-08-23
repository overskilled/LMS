"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, RotateCcw, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
    videoUrl: string
    title: string
    onComplete: () => void
    duration: number
}

export function VideoPlayer({ videoUrl, title, onComplete, duration }: VideoPlayerProps) {
    const playerRef = useRef<ReactPlayer>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [played, setPlayed] = useState(0)
    const [loaded, setLoaded] = useState(0)
    const [duration_, setDuration] = useState(duration)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showSettings, setShowSettings] = useState(false)
    const [hasCompleted, setHasCompleted] = useState(false)
    const [seeking, setSeeking] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [seekingValue, setSeekingValue] = useState(0)

    const handlePlayPause = useCallback(() => {
        setIsPlaying(!isPlaying)
    }, [isPlaying])

    const handleProgress = useCallback(
        (state: { played: number; loaded: number }) => {
            if (!seeking) {
                setPlayed(state.played)
                setLoaded(state.loaded)
            }

            if (state.played >= 0.9 && !hasCompleted) {
                setHasCompleted(true)
                onComplete()
            }
        },
        [seeking, hasCompleted, onComplete],
    )

    const handleSeekMouseDown = useCallback(() => {
        setSeeking(true)
        setSeekingValue(Math.round(played * 100))
    }, [played])

    const handleSeekChange = useCallback((value: number[]) => {
        setSeekingValue(value[0])
    }, [])

    const handleSeekMouseUp = useCallback((value: number[]) => {
        setSeeking(false)
        const seekTo = value[0] / 100
        setPlayed(seekTo)
        setSeekingValue(value[0])
        playerRef.current?.seekTo(seekTo)
    }, [])

    const handleVolumeChange = useCallback((value: number[]) => {
        const newVolume = value[0] / 100
        setVolume(newVolume)
        setMuted(newVolume === 0)
    }, [])

    const handleMute = useCallback(() => {
        setMuted(!muted)
    }, [muted])

    const handleDuration = useCallback((duration: number) => {
        setDuration(duration)
    }, [])

    const handleEnded = useCallback(() => {
        setIsPlaying(false)
        if (!hasCompleted) {
            setHasCompleted(true)
            onComplete()
        }
    }, [hasCompleted, onComplete])

    const handleRestart = useCallback(() => {
        playerRef.current?.seekTo(0)
        setPlayed(0)
        setHasCompleted(false)
    }, [])

    const changePlaybackRate = useCallback((rate: number) => {
        setPlaybackRate(rate)
        setShowSettings(false)
    }, [])

    const formatTime = useCallback((seconds: number) => {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00"
        const minutes = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${minutes}:${secs.toString().padStart(2, "0")}`
    }, [])

    const progressSliderValue = useMemo(
        () => [seeking ? seekingValue : Math.round(played * 100)],
        [seeking, seekingValue, played],
    )
    const volumeSliderValue = useMemo(() => [Math.round((muted ? 0 : volume) * 100)], [muted, volume])

    const currentTime = played * duration_

    return (
        <div
            className="relative bg-black rounded-lg overflow-hidden group cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={isPlaying}
                volume={volume}
                muted={muted}
                playbackRate={playbackRate}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={handleEnded}
                config={{
                    file: {
                        attributes: {
                            preload: "metadata",
                            playsInline: true,
                        },
                    },
                }}
                style={{ aspectRatio: "16/9" }}
            />

            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 sm:p-4 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0",
                )}
            >
                <div className="space-y-2 sm:space-y-3">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 sm:gap-3 text-white text-xs sm:text-sm">
                        <span className="min-w-[35px] sm:min-w-[40px] text-xs sm:text-sm">{formatTime(currentTime)}</span>
                        <div className="flex-1">
                            <Slider
                                value={progressSliderValue}
                                onValueChange={handleSeekChange}
                                onValueCommit={handleSeekMouseUp}
                                onPointerDown={handleSeekMouseDown}
                                max={100}
                                step={0.1}
                                className="w-full"
                            />
                        </div>
                        <span className="min-w-[35px] sm:min-w-[40px] text-xs sm:text-sm">{formatTime(duration_)}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handlePlayPause()
                                }}
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                                {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                            </Button>

                            {/* Volume controls */}
                            <div className="hidden sm:flex items-center gap-2 group/volume">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleMute()
                                    }}
                                    className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                                >
                                    {muted || volume === 0 ? (
                                        <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                                    ) : (
                                        <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    )}
                                </Button>
                                <div className="w-16 sm:w-20 opacity-0 group-hover/volume:opacity-100 transition-opacity">
                                    <Slider
                                        value={volumeSliderValue}
                                        onValueCommit={handleVolumeChange}
                                        max={100}
                                        step={5}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Settings */}
                            <div className="relative hidden sm:block">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowSettings(!showSettings)
                                    }}
                                    className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0"
                                >
                                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>

                                {showSettings && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[120px]">
                                        <div className="text-white text-sm space-y-1">
                                            <p className="font-medium mb-2">Playback Speed</p>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        changePlaybackRate(rate)
                                                    }}
                                                    className={cn(
                                                        "block w-full text-left px-2 py-1 rounded hover:bg-white/20",
                                                        playbackRate === rate && "bg-primary/50",
                                                    )}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Restart */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRestart()
                                }}
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 hidden sm:flex"
                            >
                                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                        size="lg"
                        onClick={(e) => {
                            e.stopPropagation()
                            handlePlayPause()
                        }}
                        className="rounded-full w-16 h-16 sm:w-20 sm:h-20 bg-primary/90 hover:bg-primary shadow-lg"
                    >
                        <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1" />
                    </Button>
                </div>
            )}

            {hasCompleted && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <div className="bg-primary/90 text-primary-foreground px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                        ✓ Completed
                    </div>
                </div>
            )}
        </div>
    )
}
