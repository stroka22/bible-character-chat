import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Product IDs (must match App Store Connect)
export const PRODUCT_MONTHLY = 'com.faithtalkai.premium.monthly';
export const PRODUCT_YEARLY = 'com.faithtalkai.premium.yearly';

const PREMIUM_KEY = 'iap.premium.active';

export async function isLocalPremiumActive(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(PREMIUM_KEY)) === '1'; } catch { return false; }
}

async function setLocalPremiumActive(active: boolean) {
  try { await AsyncStorage.setItem(PREMIUM_KEY, active ? '1' : '0'); } catch {}
}

export async function initIAP() {
  if (Platform.OS !== 'ios') return; // focus on iOS for Apple review
  try {
    await InAppPurchases.connectAsync();
    // Optionally fetch available products to prime the cache
    await InAppPurchases.getProductsAsync([PRODUCT_MONTHLY, PRODUCT_YEARLY]);
  } catch {}
}

export async function disconnectIAP() {
  try { await InAppPurchases.disconnectAsync(); } catch {}
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
  await initIAP();
  try {
    const { results: products, responseCode } = await InAppPurchases.getProductsAsync([productId]);
    if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
      throw new Error(`Failed to load products (code: ${responseCode})`);
    }
    if (!products || products.length === 0) {
      throw new Error(`Product "${productId}" not found in App Store. Check that the product ID matches exactly and the product status is "Ready to Submit".`);
    }
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
          }
        } finally {
          try { (InAppPurchases as any).setPurchaseListener(null); } catch {}
          try { await disconnectIAP(); } catch {}
        }
      })();
    });
    await InAppPurchases.purchaseItemAsync(productId);
    return { ok: true };
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
