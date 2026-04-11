import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never', // No prefix in URL (user's preferred locale is stored in cookie)
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
