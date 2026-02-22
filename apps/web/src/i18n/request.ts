import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, Locale } from '../utils/i18n';

export default getRequestConfig(async () => {
    const locale = defaultLocale as Locale;

    return {
        locale,
        messages: (await import(`./${locale}.json`)).default
    };
});
