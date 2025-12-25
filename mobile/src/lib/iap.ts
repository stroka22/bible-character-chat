import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Product IDs (must match App Store Connect)
export const PRODUCT_MONTHLY = 'FTAIMONTHLY';
export const PRODUCT_YEARLY = 'FTAIYEARLY';

const PREMIUM_KEY = 'iap.premium.active';
let iapConnected = false;
let cachedProducts: InAppPurchases.IAPItemDetails[] = [];

export async function isLocalPremiumActive(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(PREMIUM_KEY)) === '1'; } catch { return false; }
}

async function setLocalPremiumActive(active: boolean) {
  try { await AsyncStorage.setItem(PREMIUM_KEY, active ? '1' : '0'); } catch {}
}

export async function initIAP(): Promise<{ connected: boolean; products: InAppPurchases.IAPItemDetails[] }> {
  if (Platform.OS !== 'ios') return { connected: false, products: [] };
  try {
    if (!iapConnected) {
      await InAppPurchases.connectAsync();
      iapConnected = true;
    }
    // Always fetch products to ensure they're queried before purchase
    const { results, responseCode } = await InAppPurchases.getProductsAsync([PRODUCT_MONTHLY, PRODUCT_YEARLY]);
    if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
      cachedProducts = results;
    }
    return { connected: true, products: cachedProducts };
  } catch (e) {
    console.warn('[IAP] initIAP error:', e);
    return { connected: false, products: [] };
  }
}

export async function disconnectIAP() {
  try {
    await InAppPurchases.disconnectAsync();
    iapConnected = false;
    cachedProducts = [];
  } catch {}
}

async function markPremiumOnServer(userId?: string) {
  try {
    if (!userId) return;
    await supabase.from('profiles').update({ premium_override: true }).eq('id', userId);
  } catch {}
}

export async function restorePurchases(userId?: string) {
  if (Platform.OS !== 'ios') return { restored: false };
  try {
    await initIAP();
    const anyHist: any = await (InAppPurchases as any).getPurchaseHistoryAsync();
    const results = (anyHist && (anyHist.results || anyHist)) || [];
    const responseCode = (anyHist && anyHist.responseCode) || InAppPurchases.IAPResponseCode.OK;
    if (responseCode !== InAppPurchases.IAPResponseCode.OK) return { restored: false };
    const hasSub = (results || []).some((r: any) => [PRODUCT_MONTHLY, PRODUCT_YEARLY].includes(r.productId));
    if (hasSub) {
      await setLocalPremiumActive(true);
      await markPremiumOnServer(userId);
      return { restored: true };
    }
    return { restored: false };
  } catch {
    return { restored: false };
  } finally {
    try { await disconnectIAP(); } catch {}
  }
}

async function purchase(productId: string, userId?: string) {
  if (Platform.OS !== 'ios') {
    return { ok: false, error: new Error('IAP not supported on this platform yet') };
  }
  
  try {
    // Step 1: Connect and fetch products (MUST happen before purchase)
    const { connected, products: initProducts } = await initIAP();
    if (!connected) {
      throw new Error('Failed to connect to App Store. Please check your internet connection and try again.');
    }
    
    // Step 2: Explicitly query the specific product to satisfy StoreKit requirement
    const { results: products, responseCode } = await InAppPurchases.getProductsAsync([productId]);
    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      throw new Error(`Failed to load products (code: ${responseCode})`);
    }
    if (!products || products.length === 0) {
      throw new Error(`Product "${productId}" not found in App Store. Check that the product ID matches exactly and the product status is "Ready to Submit".`);
    }
    
    // Step 3: Set up purchase listener BEFORE initiating purchase
    return new Promise((resolve) => {
      InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
        (async () => {
          try {
            if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
              for (const p of results) {
                if (p.acknowledged) continue;
                await InAppPurchases.finishTransactionAsync(p, true);
                if ([PRODUCT_MONTHLY, PRODUCT_YEARLY].includes(p.productId)) {
                  await setLocalPremiumActive(true);
                  await markPremiumOnServer(userId);
                }
              }
              resolve({ ok: true });
            } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
              resolve({ ok: false, error: new Error('Purchase cancelled') });
            } else {
              resolve({ ok: false, error: new Error(`Purchase failed (code: ${responseCode}, error: ${errorCode})`) });
            }
          } catch (e) {
            resolve({ ok: false, error: e });
          } finally {
            try { (InAppPurchases as any).setPurchaseListener(null); } catch {}
          }
        })();
      });
      
      // Step 4: Initiate purchase AFTER listener is set and products are queried
      InAppPurchases.purchaseItemAsync(productId).catch((e) => {
        resolve({ ok: false, error: e });
      });
    });
  } catch (e) {
    return { ok: false, error: e };
  }
}

export async function purchaseMonthly(userId?: string) {
  return purchase(PRODUCT_MONTHLY, userId);
}

export async function purchaseYearly(userId?: string) {
  return purchase(PRODUCT_YEARLY, userId);
}

// Debug helper to check product availability
export async function getAvailableProducts(): Promise<{ products: InAppPurchases.IAPItemDetails[]; error?: string }> {
  if (Platform.OS !== 'ios') {
    return { products: [], error: 'IAP only available on iOS' };
  }
  try {
    const { connected, products } = await initIAP();
    if (!connected) {
      return { products: [], error: 'Failed to connect to App Store' };
    }
    return { products };
  } catch (e: any) {
    return { products: [], error: e?.message || 'Unknown error' };
  }
}
