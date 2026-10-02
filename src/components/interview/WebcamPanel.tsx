import { CameraOff, Mic, MicOff, PhoneOff, Video, VideoOff, Maximize } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { MediaPermission } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";

export function WebcamPanel({
  stream,
  cameraState,
  cameraOn,
  micOn,
  recording,
  onToggleCamera,
  onToggleMic,
  onEnd,
}: {
  stream: MediaStream | null;
  cameraState: MediaPermission;
  cameraOn: boolean;
  micOn: boolean;
  recording: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onEnd: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const showVideo = cameraState === "granted" && cameraOn;

  return (
    <div ref={wrapRef} className="relative aspect-video w-full overflow-hidden rounded-3xl bg-foreground/90">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn("h-full w-full -scale-x-100 object-cover", !showVideo && "invisible")}
        aria-label="Your camera preview (mirrored)"
      />
      {!showVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-background">
          <CameraOff className="size-8 opacity-80" aria-hidden="true" />
          <p className="max-w-sm text-sm opacity-90">
            {cameraState === "denied"
              ? "Camera access is required for Live Mirror's visual coaching. You can continue without visual analysis."
              : cameraState === "unavailable"
                ? "No camera available in this browser."
                : "Camera is off."}
          </p>
        </div>
      ) : null}

      {recording ? (
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium" role="status">
          <span className="size-2 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
          Listening
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-4">
        <Button size="icon" variant="secondary" className="rounded-full" onClick={onToggleMic} aria-label={micOn ? "Mute microphone" : "Unmute microphone"} aria-pressed={!micOn}>
          {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </Button>
        <Button size="icon" variant="secondary" className="rounded-full" onClick={onToggleCamera} aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} aria-pressed={!cameraOn} disabled={cameraState !== "granted"}>
          {cameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
        </Button>
        <Button size="icon" variant="secondary" className="rounded-full" aria-label="Fullscreen" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrapRef.current?.requestFullscreen())}>
          <Maximize className="size-4" />
        </Button>
        <Button size="icon" variant="destructive" className="rounded-full" onClick={onEnd} aria-label="End interview">
          <PhoneOff className="size-4" />
        </Button>
      </div>
    </div>
  );
}
