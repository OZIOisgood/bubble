import { Audio } from 'expo-av';

type SoundInstance = {
  sound: Audio.Sound;
  isPlaying: boolean;
  volume: number;
};

export class SoundService {
  private static instance: SoundService;
  private sounds: { [id: string]: SoundInstance } = {};
  private lastPausedId: string | null = null;

  private constructor() {}

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  public async playSound(
    id: string,
    url: string,
    volume: number
  ): Promise<void> {
    if (this.sounds[id]) {
      await this.sounds[id].sound.setVolumeAsync(volume);
      await this.sounds[id].sound.playAsync();
      this.sounds[id].isPlaying = true;
      this.sounds[id].volume = volume;
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.setVolumeAsync(volume);
      this.sounds[id] = { sound, isPlaying: true, volume };
      await sound.playAsync();
    }
  }

  public async pauseSound(id: string): Promise<void> {
    if (this.sounds[id] && this.sounds[id].isPlaying) {
      await this.sounds[id].sound.pauseAsync();
      this.sounds[id].isPlaying = false;
      this.lastPausedId = id;
    }
  }

  public async pauseAllSounds(): Promise<void> {
    const pausePromises = Object.values(this.sounds).map(
      async (soundInstance) => {
        if (soundInstance.isPlaying) {
          await soundInstance.sound.pauseAsync();
          soundInstance.isPlaying = false;
          this.lastPausedId =
            Object.keys(this.sounds).find(
              (key) => this.sounds[key] === soundInstance
            ) || null;
        }
      }
    );
    await Promise.all(pausePromises);
  }

  public async stopAllSounds(): Promise<void> {
    const stopPromises = Object.values(this.sounds).map(
      async (soundInstance) => {
        await soundInstance.sound.stopAsync();
        soundInstance.isPlaying = false;
      }
    );
    await Promise.all(stopPromises);
    this.lastPausedId = null;
  }

  public async unpauseLastSound(): Promise<void> {
    if (this.lastPausedId && this.sounds[this.lastPausedId]) {
      await this.sounds[this.lastPausedId].sound.playAsync();
      this.sounds[this.lastPausedId].isPlaying = true;
    }
  }
}
