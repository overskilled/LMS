"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    RotateCcw,
    Settings,
    SkipBack,
    SkipForward,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
    videoUrl: string
    title: string
    onComplete: () => void
    duration: number
}

export function VideoPlayer({ videoUrl, title, onComplete, duration }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [videoDuration, setVideoDuration] = useState(duration)
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [hasCompleted, setHasCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showSettings, setShowSettings] = useState(false)
    const [isBuffering, setIsBuffering] = useState(false)

    const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleLoadedData = () => {
            setIsLoading(false)
            setVideoDuration(video.duration)
        }

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)

            // Mark as completed when 90% watched
            if (video.currentTime / video.duration >= 0.9 && !hasCompleted) {
                setHasCompleted(true)
                onComplete()
            }
        }

        const handleEnded = () => {
            setIsPlaying(false)
            if (!hasCompleted) {
                setHasCompleted(true)
                onComplete()
            }
        }

        const handleWaiting = () => setIsBuffering(true)
        const handleCanPlay = () => setIsBuffering(false)
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        video.addEventListener("loadeddata", handleLoadedData)
        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("ended", handleEnded)
        video.addEventListener("waiting", handleWaiting)
        video.addEventListener("canplay", handleCanPlay)
        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)

        return () => {
            video.removeEventListener("loadeddata", handleLoadedData)
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("ended", handleEnded)
            video.removeEventListener("waiting", handleWaiting)
            video.removeEventListener("canplay", handleCanPlay)
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
        }
    }, [onComplete, hasCompleted])

    useEffect(() => {
        let timeout: NodeJS.Timeout

        const resetTimeout = () => {
            clearTimeout(timeout)
            setShowControls(true)
            if (isPlaying) {
                timeout = setTimeout(() => setShowControls(false), 3000)
            }
        }

        const handleMouseMove = () => resetTimeout()
        const handleMouseLeave = () => {
            clearTimeout(timeout)
            if (isPlaying) setShowControls(false)
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener("mousemove", handleMouseMove)
            container.addEventListener("mouseleave", handleMouseLeave)
        }

        resetTimeout()

        return () => {
            clearTimeout(timeout)
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove)
                container.removeEventListener("mouseleave", handleMouseLeave)
            }
        }
    }, [isPlaying])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    const togglePlay = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play()
        }
    }, [isPlaying])

    const toggleMute = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        video.muted = !isMuted
        setIsMuted(!isMuted)
    }, [isMuted])

    const handleVolumeChange = useCallback((value: number[]) => {
        const video = videoRef.current
        if (!video) return

        const newVolume = value[0] / 100
        video.volume = newVolume
        setVolume(newVolume)
        setIsMuted(newVolume === 0)
    }, [])

    const handleSeek = useCallback(
        (value: number[]) => {
            const video = videoRef.current
            if (!video) return

            const newTime = (value[0] / 100) * videoDuration
            video.currentTime = newTime
            setCurrentTime(newTime)
        },
        [videoDuration],
    )

    const skip = useCallback(
        (seconds: number) => {
            const video = videoRef.current
            if (!video) return

            video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, videoDuration))
        },
        [videoDuration],
    )

    const changePlaybackRate = useCallback((rate: number) => {
        const video = videoRef.current
        if (!video) return

        video.playbackRate = rate
        setPlaybackRate(rate)
        setShowSettings(false)
    }, [])

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current
        if (!container) return

        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            container.requestFullscreen()
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!containerRef.current?.contains(document.activeElement)) return

            switch (e.code) {
                case "Space":
                    e.preventDefault()
                    togglePlay()
                    break
                case "ArrowLeft":
                    e.preventDefault()
                    skip(-10)
                    break
                case "ArrowRight":
                    e.preventDefault()
                    skip(10)
                    break
                case "KeyM":
                    e.preventDefault()
                    toggleMute()
                    break
                case "KeyF":
                    e.preventDefault()
                    toggleFullscreen()
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [togglePlay, skip, toggleMute, toggleFullscreen])

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative bg-black rounded-lg overflow-hidden group cursor-pointer",
                isFullscreen && "rounded-none",
            )}
            onClick={togglePlay}
            tabIndex={0}
        >
            <video ref={videoRef} src={videoUrl} className="w-full aspect-video" preload="metadata" />

            {/* Loading Spinner */}
            {(isLoading || isBuffering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0",
                )}
            >
                <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 text-white text-sm">
                        <span className="min-w-[40px]">{formatTime(currentTime)}</span>
                        <div className="flex-1">
                            <Slider
                                value={[progress]}
                                onValueCommit={handleSeek}
                                max={100}
                                step={0.1}
                                className="w-full"
                            />
                        </div>
                        <span className="min-w-[40px]">{formatTime(videoDuration)}</span>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    togglePlay()
                                }}
                                className="text-white hover:bg-white/20"
                            >
                                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    skip(-10)
                                }}
                                className="text-white hover:bg-white/20"
                            >
                                <SkipBack className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    skip(10)
                                }}
                                className="text-white hover:bg-white/20"
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2 group/volume">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleMute()
                                    }}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <div className="w-20 opacity-0 group-hover/volume:opacity-100 transition-opacity">
                                    <Slider
                                        value={[isMuted ? 0 : volume * 100]}
                                        onValueChange={handleVolumeChange}
                                        max={100}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowSettings(!showSettings)
                                    }}
                                    className="text-white hover:bg-white/20"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>

                                {/* Settings Menu */}
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

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = 0
                                        setCurrentTime(0)
                                    }
                                }}
                                className="text-white hover:bg-white/20"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFullscreen()
                                }}
                                className="text-white hover:bg-white/20"
                            >
                                <Maximize className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Play Button Overlay */}
            {!isPlaying && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                        size="lg"
                        onClick={(e) => {
                            e.stopPropagation()
                            togglePlay()
                        }}
                        className="rounded-full w-20 h-20 bg-primary/90 hover:bg-primary shadow-lg"
                    >
                        <Play className="h-10 w-10 ml-1" />
                    </Button>
                </div>
            )}

            {/* Completion Badge */}
            {hasCompleted && (
                <div className="absolute top-4 right-4">
                    <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Completed
                    </div>
                </div>
            )}
        </div>
    )
}