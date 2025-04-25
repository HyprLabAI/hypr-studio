import { GeneratedImage, GeneratedVideo, GeneratedMedia } from "../types";

const DB_NAME = "hyprFluxDB";
const DB_VERSION = 1;
const IMAGE_STORE_NAME = "imageData";
const METADATA_KEY = "hyprFluxMediaHistory";

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
            db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "id" });
          }
        };
      });

      console.log("IndexedDB initialized successfully for image data");
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
      throw error;
    }
  }

  async saveMedia(
    media: GeneratedMedia,
    prepend: boolean = true,
  ): Promise<void> {
    if (!this.db && media.type === "image") {
      await this.init();
    }
    if (!this.db && media.type === "image")
      throw new Error("Database not initialized for saving image data");

    try {
      let metaToStore: Omit<GeneratedMedia, "imageData"> | GeneratedVideo;

      if (media.type === "image") {
        await new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(
            IMAGE_STORE_NAME,
            "readwrite",
          );
          const store = transaction.objectStore(IMAGE_STORE_NAME);
          const request = store.put({
            id: media.timestamp,
            imageData: media.imageData,
          });

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });

        const { imageData, settings, ...otherMeta } = media;
        const cleanSettings = this.cleanSettingsForStorage(settings);
        metaToStore = {
          ...otherMeta,
          settings: cleanSettings,
        };
        console.log(
          "Image data saved to IndexedDB, metadata prepared:",
          media.timestamp,
        );
      } else if (media.type === "video") {
        const { settings, ...otherMeta } = media;
        const cleanSettings = this.cleanSettingsForStorage(settings);
        metaToStore = {
          ...otherMeta,
          settings: cleanSettings,
        };
        console.log("Video metadata prepared:", media.timestamp);
      } else {
        console.warn("Unsupported media type:", media);
        return;
      }

      const savedMetadata = localStorage.getItem(METADATA_KEY);
      const metadataList: GeneratedMedia[] = savedMetadata
        ? JSON.parse(savedMetadata)
        : [];

      if (prepend) {
        metadataList.unshift(metaToStore as GeneratedMedia);
      } else {
        metadataList.push(metaToStore as GeneratedMedia);
      }

      localStorage.setItem(METADATA_KEY, JSON.stringify(metadataList));
      console.log(
        "Media metadata saved to localStorage:",
        media.timestamp,
        "Type:",
        media.type,
      );
    } catch (error) {
      console.error(`Failed to save ${media.type}:`, error);
    }
  }

  private cleanSettingsForStorage(
    settings: Record<string, any>,
  ): Record<string, any> {
    const cleanSettings = Object.entries(settings)
      .filter(([key, value]) => {
        if (value === null || value === undefined || value === "") return false;
        if (key === "control_image") return false;
        if (key === "image_prompt") return false;
        if (key === "start_image") return false;
        if (key === "end_image") return false;
        if (key === "raw" && value === false) return false;
        if (key === "response_format") return false;
        if (key === "output_format") return false;
        if (key === "model") return true;
        if (key.endsWith("_file")) return true;
        return true;
      })
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    if (settings.control_image) {
      cleanSettings.control_image_file = "control_image.temp";
    }
    if (settings.image_prompt) {
      cleanSettings.image_prompt_file = "image_prompt.temp";
    }
    if (settings.start_image) {
      cleanSettings.start_image_file = "start_image.temp";
    }
    if (settings.end_image) {
      cleanSettings.end_image_file = "end_image.temp";
    }

    return cleanSettings;
  }

  async importMedia(mediaList: GeneratedMedia[]): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error("Database not initialized for import");

    try {
      const savedMetadata = localStorage.getItem(METADATA_KEY);
      const existingMetadata: GeneratedMedia[] = savedMetadata
        ? JSON.parse(savedMetadata)
        : [];
      const existingTimestamps = new Set(
        existingMetadata.map((m) => m.timestamp),
      );

      const newMedia = mediaList.filter(
        (item) => !existingTimestamps.has(item.timestamp),
      );

      if (newMedia.length === 0) {
        console.log("Import: No new media items found.");
        return;
      }

      for (const media of newMedia) {
        const cleanSettings = this.cleanSettingsForStorage(media.settings);
        const mediaToSave = { ...media, settings: cleanSettings };

        if (
          mediaToSave.type === "image" &&
          !(mediaToSave as GeneratedImage).imageData
        ) {
          console.warn(
            `Import: Image metadata found without imageData for ${mediaToSave.timestamp}. Skipping save.`,
          );
          continue;
        }

        await this.saveMedia(mediaToSave, false);
      }

      console.log(`Imported ${newMedia.length} new media items.`);
    } catch (error) {
      console.error("Failed to import media:", error);
      throw error;
    }
  }

  async deleteMedia(timestamp: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error("Database not initialized for delete");

    try {
      const savedMetadata = localStorage.getItem(METADATA_KEY);
      let mediaType: "image" | "video" | null = null;
      let updatedMetadata: GeneratedMedia[] = [];

      if (savedMetadata) {
        const metadataList: GeneratedMedia[] = JSON.parse(savedMetadata);
        updatedMetadata = metadataList.filter((item) => {
          if (item.timestamp === timestamp) {
            mediaType = item.type;
            return false;
          }
          return true;
        });
        localStorage.setItem(METADATA_KEY, JSON.stringify(updatedMetadata));
      }

      if (mediaType === "image") {
        await new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(
            IMAGE_STORE_NAME,
            "readwrite",
          );
          const store = transaction.objectStore(IMAGE_STORE_NAME);
          const request = store.delete(timestamp);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
        console.log("Image data deleted from IndexedDB:", timestamp);
      } else if (mediaType === "video") {
        console.log("Video metadata deleted from localStorage:", timestamp);
      } else {
        console.log(
          "Media item not found in metadata or type unknown:",
          timestamp,
        );
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  }

  async loadMedia(): Promise<GeneratedMedia[]> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error("Database not initialized for loading media");

    try {
      const savedMetadata = localStorage.getItem(METADATA_KEY);
      if (!savedMetadata) {
        console.log("No saved media metadata found");
        return [];
      }

      const metadataList: (
        | Omit<GeneratedImage, "imageData">
        | GeneratedVideo
      )[] = JSON.parse(savedMetadata);
      console.log("Loading media for metadata entries:", metadataList.length);

      const loadedMedia = await Promise.all(
        metadataList.map(async (meta) => {
          try {
            if (meta.type === "image") {
              const imageData = await this.getImageData(meta.timestamp);
              if (imageData) {
                return { ...meta, imageData } as GeneratedImage;
              } else {
                console.warn(
                  "No image data found in IndexedDB for:",
                  meta.timestamp,
                  "- removing from history.",
                );
                return null;
              }
            } else if (meta.type === "video") {
              return meta as GeneratedVideo;
            } else {
              console.warn("Unknown media type in metadata:", meta);
              return null;
            }
          } catch (error) {
            console.error(
              "Error loading media item:",
              meta.timestamp ?? "Unknown Timestamp",
              error,
            );
            return null;
          }
        }),
      );

      const validMedia = loadedMedia.filter(
        (item): item is GeneratedMedia => item !== null,
      );
      console.log(
        "Successfully loaded/reconstructed media items:",
        validMedia.length,
      );
      return validMedia;
    } catch (error) {
      console.error("Failed to load media metadata:", error);
      return [];
    }
  }

  private async getImageData(id: string): Promise<string | null> {
    if (!this.db)
      throw new Error("Database not initialized for getting image data");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(IMAGE_STORE_NAME, "readonly");
      const store = transaction.objectStore(IMAGE_STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.imageData || null);
      };
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error("Database not initialized for clearing");

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(IMAGE_STORE_NAME, "readwrite");
        const store = transaction.objectStore(IMAGE_STORE_NAME);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      console.log("IndexedDB image data store cleared.");

      localStorage.removeItem(METADATA_KEY);
      console.log("LocalStorage media metadata cleared.");
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }
}
