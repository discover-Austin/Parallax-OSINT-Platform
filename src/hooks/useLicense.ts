import { useState, useEffect, useCallback } from 'react';
import {
  getLicenseTier,
  hasFeature,
  validateLicense,
  type LicenseActivationResult,
} from '../services/tauri';

export interface LicenseState {
  tier: string;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
}

export interface UseLicenseReturn extends LicenseState {
  refreshLicense: () => Promise<void>;
  checkFeature: (feature: string) => Promise<boolean>;
  isPro: boolean;
  isFree: boolean;
  isTeam: boolean;
  isEnterprise: boolean;
}

/**
 * Custom hook for managing license state across the application
 *
 * Usage:
 * ```tsx
 * const { tier, isPro, checkFeature, refreshLicense } = useLicense();
 *
 * if (isPro) {
 *   // Show pro features
 * }
 *
 * const canExport = await checkFeature('export');
 * ```
 */
export function useLicense(): UseLicenseReturn {
  const [state, setState] = useState<LicenseState>({
    tier: 'free',
    isLoading: true,
    error: null,
    isValid: false,
  });

  /**
   * Fetch current license status from backend
   */
  const fetchLicenseStatus = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Validate license first
      const isValid = await validateLicense();

      // Get license tier
      const tier = await getLicenseTier();

      setState({
        tier,
        isValid,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch license status:', error);
      setState({
        tier: 'free',
        isValid: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch license',
      });
    }
  }, []);

  /**
   * Refresh license status (useful after activation/deactivation)
   */
  const refreshLicense = useCallback(async () => {
    await fetchLicenseStatus();
  }, [fetchLicenseStatus]);

  /**
   * Check if license includes a specific feature
   */
  const checkFeature = useCallback(async (feature: string): Promise<boolean> => {
    try {
      return await hasFeature(feature);
    } catch (error) {
      console.error(`Failed to check feature ${feature}:`, error);
      return false;
    }
  }, []);

  // Fetch license status on mount
  useEffect(() => {
    fetchLicenseStatus();
  }, [fetchLicenseStatus]);

  // Computed properties for convenience
  const isPro = state.tier === 'professional';
  const isFree = state.tier === 'free';
  const isTeam = state.tier === 'team';
  const isEnterprise = state.tier === 'enterprise';

  return {
    ...state,
    refreshLicense,
    checkFeature,
    isPro,
    isFree,
    isTeam,
    isEnterprise,
  };
}

/**
 * Hook specifically for usage limits based on license tier
 */
export function useUsageLimits() {
  const { tier, isPro } = useLicense();

  return {
    maxAIGenerationsPerDay: isPro ? Infinity : 10,
    maxDorks: isPro ? Infinity : 50,
    maxConversations: isPro ? Infinity : 10,
    canExport: isPro,
    canUseAdvancedFeatures: isPro,
    tier,
  };
}
