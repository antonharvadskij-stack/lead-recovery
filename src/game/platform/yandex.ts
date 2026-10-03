/**
 * Адаптер платформы. На Yandex Games подключите SDK в index.html (<script src="/sdk.js">),
 * здесь он будет найден автоматически. В обычном вебе работает заглушка.
 */
type YaSDK = {
  features?: { LoadingAPI?: { ready: () => void } };
  adv?: { showFullscreenAdv: (o: { callbacks?: Record<string, () => void> }) => void };
};

let sdk: YaSDK | null = null;

export const Platform = {
  async init() {
    const w = window as unknown as { YaGames?: { init: () => Promise<YaSDK> } };
    if (w.YaGames) {
      try {
        sdk = await w.YaGames.init();
      } catch (e) {
        console.warn("Yandex SDK init failed", e);
      }
    }
    return { isYandex: !!sdk };
  },
  /** Сообщить платформе, что игра загружена и готова. */
  gameReady() {
    sdk?.features?.LoadingAPI?.ready();
  },
  showInterstitial(onClose?: () => void) {
    if (!sdk?.adv) return onClose?.();
    sdk.adv.showFullscreenAdv({ callbacks: { onClose: () => onClose?.(), onError: () => onClose?.() } });
  },
};