import i18next from 'i18next';
import i18nextXhrBackend from 'i18next-xhr-backend';
import { LanguageService, I18NConfig } from '@spartacus/core';

export function i18NextInit(
  config: I18NConfig,
  languageService: LanguageService
): () => Promise<any> {
  return () => {
    let i18NextConfig: i18next.InitOptions = {
      fallbackLng: config.i18n.fallbackLang,
      ns: config.i18n.preloadNamespaces,
      debug: config.i18n.debug
    };
    if (config.i18n.backend) {
      i18next.use(i18nextXhrBackend);
      i18NextConfig = { ...i18NextConfig, backend: config.i18n.backend };
    }
    return i18next.init(i18NextConfig, () => {
      // Don't use i18next's 'resources' config key, because it will disable loading chunks from backend.
      // Resources should be added, in the callback.
      i18NextAddTranslations(config.i18n.resources);
      syncI18NextWithSiteContext(languageService);
    });
  };
}

export function i18NextAddTranslations(resources: i18next.Resource = {}) {
  Object.keys(resources).forEach(lang => {
    Object.keys(resources[lang]).forEach(namespace => {
      i18next.addResourceBundle(
        lang,
        namespace,
        resources[lang][namespace],
        true,
        true
      );
    });
  });
}

export function syncI18NextWithSiteContext(language: LanguageService) {
  // always update language of i18next on site context change
  language.getActive().subscribe(lang => i18next.changeLanguage(lang));
}
