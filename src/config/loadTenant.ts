import axios from 'axios';

export interface FabricOption {
  id: string;
  name: string;
  colors: string[];
}

export interface GarmentOption {
  id: string;
  name: string;
  description: string;
}

export interface DesignOption {
  id: string;
  name: string;
}

export interface DesignOptions {
  neckDesigns: DesignOption[];
  embroideryStyles: DesignOption[];
  paintingStyles: DesignOption[];
}

export interface MeasurementField {
  id: string;
  name: string;
  required: boolean;
}

export interface PaymentConfig {
  upiId: string;
  upiQrImage: string;
}

export interface TenantConfig {
  tenant_id: string;
  brandName: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  banner: string;
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  payment: PaymentConfig;
  fabricOptions: FabricOption[];
  garmentOptions: GarmentOption[];
  designOptions: DesignOptions;
  measurementFields: MeasurementField[];
}

const defaultConfig: TenantConfig = {
  tenant_id: 'default',
  brandName: 'StoreFuse',
  tagline: 'Custom Tailoring Made Easy',
  description: 'Build your brand with StoreFuse',
  primaryColor: '#1a1a1a',
  secondaryColor: '#fafafa',
  accentColor: '#2d2d2d',
  logo: '/logos/storefuse.svg',
  banner: '/banners/default-hero.jpg',
  social: {},
  payment: {
    upiId: '',
    upiQrImage: '',
  },
  fabricOptions: [],
  garmentOptions: [],
  designOptions: {
    neckDesigns: [],
    embroideryStyles: [],
    paintingStyles: [],
  },
  measurementFields: [],
};

export async function loadTenantConfig(tenantId: string): Promise<TenantConfig> {
  try {
    const response = await axios.get<TenantConfig>(`/config/${tenantId}.json`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to load config for tenant: ${tenantId}, using default`);
    return defaultConfig;
  }
}

export function hexToHSL(hex: string): string {
  hex = hex.replace(/^#/, '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyTenantTheme(config: TenantConfig): void {
  const root = document.documentElement;
  root.style.setProperty('--tenant-primary', hexToHSL(config.primaryColor));
  root.style.setProperty('--tenant-secondary', hexToHSL(config.secondaryColor));
  root.style.setProperty('--tenant-accent', hexToHSL(config.accentColor));
}
