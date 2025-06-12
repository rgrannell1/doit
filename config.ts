export class Config {
  static getEnv(key: string): string {
    const value = Deno.env.get(key);
    if (!value) {
      throw new Error(`Environment variable ${key} is not set.`);
    }
    return value;
  }
}

export enum Section {
  SCHEDULED = "⏰ Scheduled",
  NOTES_OPTIONS_PARCELS = "Notes, Options, Parcels",
  NO_SECTION = "No Section",
}
