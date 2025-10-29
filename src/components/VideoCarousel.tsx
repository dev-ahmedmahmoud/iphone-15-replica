import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

import { hightlightsSlides } from "@/data";

interface VideoState {
  isEnd: boolean;
  startPlay: boolean;
  videoId: number;
  isLastVideo: boolean;
  isPlaying: boolean;
}

enum HandleProcessType {
  VideoEnd = "video-end",
  VideoLast = "video-last",
  VideoReset = "video-reset",
  Pause = "pause",
  Play = "play",
}

const VideoCarousel = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement[]>([]);
  const videoSpanRef = useRef<HTMLSpanElement[]>([]);
  const videoSpanRef2 = useRef<HTMLSpanElement[]>([]);

  // video and indicator
  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  // which videos have loaded metadata
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

  useGSAP(
    () => {
      // slide the track instead of multiple elements with the same id
      if (trackRef.current) {
        gsap.to(trackRef.current, {
          xPercent: -100 * videoId,
          duration: 2,
          ease: "power2.inOut",
        });
      }

      // start playback once the carousel enters the viewport
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 80%",
        once: true,
        onEnter: () =>
          setVideo((pre) => ({
            ...pre,
            startPlay: true,
            isPlaying: true,
          })),
      });
    },
    { scope: rootRef, dependencies: [videoId] }
  );

  useEffect(() => {
    let currentProgress = 0;
    const span = videoSpanRef.current;

    if (span[videoId]) {
      // animation to move the indicator
      const anim = gsap.to(span[videoId], {
        onUpdate: () => {
          // get the progress of the video
          const progress = Math.ceil(anim.progress() * 100);

          if (progress != currentProgress) {
            currentProgress = progress;

            // set the width of the progress bar
            gsap.to(videoSpanRef2.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw" // mobile
                  : window.innerWidth < 1200
                  ? "10vw" // tablet
                  : "4vw", // laptop
            });

            // set the background color of the progress bar
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        // when the video is ended, replace the progress bar with the indicator and change the background color
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoSpanRef2.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });

      if (videoId == 0) {
        anim.restart();
      }

      // update the progress bar
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        // ticker to update the progress bar
        gsap.ticker.add(animUpdate);
      } else {
        // remove the ticker when the video is paused (progress bar is stopped)
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay]);

  // play/pause only the current video once it's actually ready
  useEffect(() => {
    if (!startPlay) return;
    const el = videoRef.current[videoId];
    if (!el) return;

    const isReady = el.readyState >= 2 || loaded.has(videoId);

    if (isPlaying && isReady) {
      el.muted = true; // ensure autoplay allowance
      el.play().catch(() => {
        // autoplay might still be blocked; keep state consistent
        setVideo((pre) => ({ ...pre, isPlaying: false }));
      });
    } else {
      el.pause();
    }
  }, [startPlay, videoId, isPlaying, loaded]);

  const handleProcess = (
    type: HandleProcessType,
    i?: number
  ): VideoState | void => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: (i ?? 0) + 1 }));
        break;
      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true }));
        break;
      case "video-reset":
        setVideo((pre) => ({ ...pre, videoId: 0, isLastVideo: false }));
        break;
      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;
      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;
      default:
        return video;
    }
  };

  const handleLoadedMetaData = (i: number) =>
    setLoaded((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });

  // Jump to a specific video by indicator click
  const handleJumpTo = (index: number) => {
    if (index === videoId) return;

    // pause current video
    videoRef.current[videoId]?.pause();

    // reset indicator visuals
    videoSpanRef2.current.forEach(
      (el) => el && gsap.set(el, { width: "12px" })
    );
    videoSpanRef.current.forEach(
      (el) => el && gsap.set(el, { width: "0%", backgroundColor: "#afafaf" })
    );

    setVideo((pre) => ({
      ...pre,
      videoId: index,
      isLastVideo: index === hightlightsSlides.length - 1,
      startPlay: true,
      isPlaying: true,
    }));
  };

  return (
    <>
      <div ref={rootRef}>
        <div ref={trackRef} className="flex items-center">
          {hightlightsSlides.map((list, i) => (
            <div key={list.id} className="sm:pr-20 pr-10">
              <div className="video-carousel_container">
                <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                  <video
                    playsInline
                    preload="auto"
                    muted
                    // keep pointer-events on video disabled; controls are outside
                    className={`${
                      list.id === 2 && "translate-x-44"
                    } pointer-events-none`}
                    ref={(el) => {
                      if (el) videoRef.current[i] = el;
                    }}
                    onEnded={() =>
                      i !== hightlightsSlides.length - 1
                        ? handleProcess(HandleProcessType.VideoEnd, i)
                        : handleProcess(HandleProcessType.VideoLast)
                    }
                    onPlay={() =>
                      setVideo((pre) => ({ ...pre, isPlaying: true }))
                    }
                    onLoadedMetadata={() => handleLoadedMetaData(i)}
                    onLoadedData={() => handleLoadedMetaData(i)}
                  >
                    <source src={list.video} type="video/mp4" />
                  </video>
                </div>

                <div className="absolute top-12 left-[5%] z-10">
                  {list.textLists.map((text, i2) => (
                    <p key={i2} className="md:text-2xl text-xl font-medium">
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative flex-center mt-10">
          <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
            {videoRef.current.map((_, i) => (
              <span
                key={i}
                className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                onClick={() => handleJumpTo(i)}
                role="button"
                aria-label={`Go to video ${i + 1}`}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && handleJumpTo(i)
                }
                ref={(el) => {
                  if (el) videoSpanRef2.current[i] = el;
                }}
              >
                <span
                  className="absolute h-full w-full rounded-full"
                  ref={(el) => {
                    if (el) videoSpanRef.current[i] = el;
                  }}
                />
              </span>
            ))}
          </div>

          <button
            className="control-btn"
            onClick={
              isLastVideo
                ? () => handleProcess(HandleProcessType.VideoReset)
                : !isPlaying
                ? () => handleProcess(HandleProcessType.Play)
                : () => handleProcess(HandleProcessType.Pause)
            }
          >
            <Image
              src={
                isLastVideo
                  ? "/assets/images/replay.svg"
                  : !isPlaying
                  ? "/assets/images/play.svg"
                  : "/assets/images/pause.svg"
              }
              alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default VideoCarousel;
