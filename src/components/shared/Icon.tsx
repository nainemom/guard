import { cx } from "@/utils/cx";
import { useEffect, useMemo, useState } from "preact/hooks";

const cache = new Map();

const downloadAndPrepareIcon = (url: URL) => {
  if (cache.has(url.href)) {
    const cached = cache.get(url.href);
    if (cached instanceof Promise) {
      return cached;
    }
    return Promise.resolve(cached);
  }
  const downloader = fetch(url.href).then((res) => res.text()).then((svgContent) => {
    const svg = (new DOMParser()).parseFromString(svgContent, 'text/xml').documentElement;
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    cache.set(url.href, svg.outerHTML);
    if (svg.querySelector('parsererror')) { // svg content is not correct
      return Promise.reject();
    }
    return svg.outerHTML;
  }).catch(() => {
    cache.delete(url.href);
    return Promise.resolve('<span style="display:inline-block;width:100%;height:100%;border-radius:50%;border:dashed 1px currentColor;"></div>');
  });
  cache.set(url.href, downloader);
  return downloader;
};

export type IconProps = {
  name: string,
  className?: string,
}

export default function Icon({ name, className }: IconProps) {
  const [iconContent, setIconContent] = useState<string>('');
  useEffect(() => {
    downloadAndPrepareIcon(
      new URL(`/icons/${name}.svg`),
    ).then(setIconContent);
  }, [name]);
  return (<span className={cx('inline-block', className)} dangerouslySetInnerHTML={{ __html: iconContent }} />);
}
