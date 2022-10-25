import { cx } from "@/utils/cx";
import { useEffect, useMemo, useState } from "preact/hooks";

const cache = new Map();

const downloadAndPrepareIcon = (url: string) => {
  if (cache.has(url)) {
    const cached = cache.get(url);
    if (cached instanceof Promise) {
      return cached;
    }
    return Promise.resolve(cached);
  }
  const downloader = fetch(url).then((res) => res.text()).then((svgContent) => {
    const svg = (new DOMParser()).parseFromString(svgContent, 'text/xml').documentElement;
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 48 48');
    cache.set(url, svg.outerHTML);
    if (svg.querySelector('parsererror')) { // svg content is not correct
      return Promise.reject();
    }
    return svg.outerHTML;
  }).catch(() => {
    cache.delete(url);
    return Promise.resolve('<span style="display:inline-block;width:100%;height:100%;border-radius:50%;border:dashed 1px currentColor;"></div>');
  });
  cache.set(url, downloader);
  return downloader;
};

export type IconProps = {
  name: string,
  className?: string,
}

export default function Icon({ name, className }: IconProps) {
  const [iconContent, setIconContent] = useState<string>('');
  useEffect(() => {
    downloadAndPrepareIcon(`${import.meta.env.BASE_URL}icons/${name}.svg`).then(setIconContent);
  }, [name]);
  return (<div className={cx('inline-block', className)} dangerouslySetInnerHTML={{ __html: iconContent }} />);
}
