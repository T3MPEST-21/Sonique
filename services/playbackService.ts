import TrackPlayer, { Event } from 'react-native-track-player';

export const PlaybackService = async function () {

    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());

    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));

    // Handle audio ducking (when another app plays sound)
    TrackPlayer.addEventListener(Event.RemoteDuck, async (e) => {
        if (e.paused) {
            // Incoming call or external audio started
            if (e.permanent) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.pause();
            }
        } else {
            // Audio interruption ended
            await TrackPlayer.play();
        }
    });
};
