import { useCallback, useEffect, useRef, useState } from "react";

export type MediaPermission = "idle" | "requesting" | "granted" | "denied" | "unavailable";

/**
 * Live camera + microphone capture for the interview room.
 * The stream is used for preview and speech only. Nothing is recorded or uploaded.
 */
export function useMedia() {
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<MediaPermission>("idle");
  const [micState, setMicState] = useState<MediaPermission>("idle");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const request = useCallback(async (opts?: { videoDeviceId?: string; audioDeviceId?: string }) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unavailable");
      setMicState("unavailable");
      return null;
    }
    setCameraState("requesting");
    setMicState("requesting");

    let video: MediaStream | null = null;
    let audio: MediaStream | null = null;

    try {
      video = await navigator.mediaDevices.getUserMedia({
        video: opts?.videoDeviceId ? { deviceId: { exact: opts.videoDeviceId } } : true,
      });
      setCameraState("granted");
    } catch {
      setCameraState("denied");
    }

    try {
      audio = await navigator.mediaDevices.getUserMedia({
        audio: opts?.audioDeviceId ? { deviceId: { exact: opts.audioDeviceId } } : true,
      });
      setMicState("granted");
    } catch {
      setMicState("denied");
    }

    const tracks = [...(video?.getTracks() ?? []), ...(audio?.getTracks() ?? [])];
    if (!tracks.length) return null;
    const combined = new MediaStream(tracks);
    streamRef.current = combined;
    setStream(combined);
    try {
      setDevices(await navigator.mediaDevices.enumerateDevices());
    } catch {
      /* device labels are optional */
    }
    return combined;
  }, []);

  const toggleCamera = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    const next = !tracks[0]?.enabled;
    tracks.forEach((t) => (t.enabled = next));
    setCameraOn(next);
  }, []);

  const toggleMic = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    const next = !tracks[0]?.enabled;
    tracks.forEach((t) => (t.enabled = next));
    setMicOn(next);
  }, []);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  useEffect(() => () => release(), [release]);

  return { stream, cameraState, micState, cameraOn, micOn, devices, request, toggleCamera, toggleMic, release };
}
