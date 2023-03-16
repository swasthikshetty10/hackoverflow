import { formatChatMessageLinks, LiveKitRoom, VideoConference } from '@livekit/components-react';
import { LogLevel } from 'livekit-client';
import { useRouter } from 'next/router';
import { DebugMode } from '../../lib/Debug';

// This is basically create room page, the first user who creates the room will be the room owner

export default function CustomRoomConnection() {
  const router = useRouter();
  const { liveKitUrl, token } = router.query;
  if (typeof liveKitUrl !== 'string') {
    return <h2>Missing LiveKit URL</h2>;
  }
  if (typeof token !== 'string') {
    return <h2>Missing LiveKit token</h2>;
  }

  return (
    <main data-lk-theme="default">
      {liveKitUrl && (
        <LiveKitRoom token={token} serverUrl={liveKitUrl}>
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          <DebugMode logLevel={LogLevel.info} />
        </LiveKitRoom>
      )}
    </main>
  );
}
