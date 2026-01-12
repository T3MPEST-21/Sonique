import { Track } from '@/contexts/AudioContext';

export type SpiritMood = 'Calm' | 'Energetic' | 'Melancholic' | 'Focus' | 'Workout' | 'Mystic';

export interface SpiritContext {
    timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    dayOfWeek: string;
    recentMoods: SpiritMood[];
}

class SpiritCoreService {
    private static instance: SpiritCoreService;

    private constructor() { }

    public static getInstance() {
        if (!SpiritCoreService.instance) {
            SpiritCoreService.instance = new SpiritCoreService();
        }
        return SpiritCoreService.instance;
    }

    public getContext(): SpiritContext {
        const now = new Date();
        const hour = now.getHours();
        let timeOfDay: SpiritContext['timeOfDay'] = 'Morning';

        if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'Evening';
        else timeOfDay = 'Night';

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return {
            timeOfDay,
            dayOfWeek: days[now.getDay()],
            recentMoods: [] // To be implemented with persistence
        };
    }

    public predictMood(): SpiritMood {
        const context = this.getContext();

        // Simple heuristic logic
        if (context.timeOfDay === 'Morning') return 'Energetic';
        if (context.timeOfDay === 'Night') return 'Calm';
        if (['Saturday', 'Sunday'].includes(context.dayOfWeek)) return 'Workout';

        return 'Focus';
    }

    public generateSpiritPlaylist(allTracks: Track[], trackOverrides: Record<string, any>): Track[] {
        const predictedMood = this.predictMood().toLowerCase();

        // Filter tracks that match the predicted mood
        return allTracks.filter(track => {
            const mood = trackOverrides[track.id]?.mood;
            return mood === predictedMood;
        });
    }

    public getGreeting(): string {
        const context = this.getContext();
        const greetings = {
            Morning: "Rise and shine, Master. Ready for some morning energy?",
            Afternoon: "Good afternoon. How's your day progressing?",
            Evening: "The sun is setting. Time to unwind with some melodies?",
            Night: "Late hours, Master. Shall we find something soothing?"
        };
        return greetings[context.timeOfDay];
    }
}

export default SpiritCoreService.getInstance();
