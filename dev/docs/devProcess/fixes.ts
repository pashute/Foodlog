// tentative take a look at these snippents and use them 

// ==========================================
// 1. src/infrastructure/config/configAPI.ts
// ==========================================

export interface AppConfig {
  general: {
    appname: string;
    version: string;
    theme: string;
  };
  security: {
    login: string;
    scope: string;
    username: string;
  };
  sheet: {
    folderName: string;
    sheetname: string;
    sheettab?: string;
  };
  prototype: {
    enabled: boolean;
    oauthUsernameChoice: string;
  };
}

class ConfigManager {
  private config: AppConfig | null = null;

  public async getConfig(): Promise<AppConfig> {
    if (!this.config) {
      this.config = await configLoader.load();
    }
    return this.config;
  }

  public async isPrototype(): Promise<boolean> {
    const cfg = await this.getConfig();
    return cfg.prototype.enabled;
  }
}


// Config Loader with forking based on stage/prototype flag
const configLoader = {
  async load(): Promise<AppConfig> {
    const isProd = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

    if (!isProd) {
      // PROTOTYPE / MOCK MODE
      return {
        general: { appname: "Foodlog", version: "0.1.1", theme: "dark" },
        security: { login: "google", scope: "drive.file", username: "myUser" },
        sheet: { folderName: "Foodlogs", sheetname: "Foodlog", sheettab: "current-year" },
        prototype: { enabled: true, oauthUsernameChoice: "myUser" }
      };
    } else {
      // PRODUCTION MODE
      try {
        const response = await fetch('/config/appConfig.tson');
        return await response.tson();
      } catch (e) {
        throw new Error("Failed to load production configuration.");
      }
    }
  }
};

export const configAPI = new ConfigManager();