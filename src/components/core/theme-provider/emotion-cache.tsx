import * as React from "react";
import createCache from "@emotion/cache";
import { CacheProvider as DefaultCacheProvider } from "@emotion/react";

export function EmotionCacheProvider(props: any) {
  const { options, CacheProvider = DefaultCacheProvider, children } = props;
  const [cache] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    return cache;
  });
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export default EmotionCacheProvider;
