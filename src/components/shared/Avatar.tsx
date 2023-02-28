import { CryptographyPublicKey } from "@/services/cryptography";
import { cx } from "@/utils/cx";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { str2num } from '@/utils/convert';

export type AvatarProps = {
  publicKey: CryptographyPublicKey,
  className?: string,
}

export default function Avatar({ publicKey, className }: AvatarProps) {
  const svg = useRef<SVGSVGElement>(null);

  const setStyle = (partNames: string[], styles: Partial<CSSProperties>) => {
    partNames.forEach((partName) => {
      const part = svg.current?.querySelector(`#${partName}`) as HTMLElement;
      if (part) {
        Object.keys(styles).forEach((styleProp) => {
          // @ts-ignore
          part.style[styleProp] = styles[styleProp];
        });
      }
    });
  };

  useEffect(() => {
    if (!svg.current || !publicKey) return;
    const unum = (min: number, max: number, salt: string) => str2num(publicKey + salt, min, max);
    setStyle(['head-group'], {
      transform: `rotate(${unum(-4, 4, 'head-angle')}deg)`,
    });
  
    setStyle(['ear-left'], {
      transform: `translateY(${unum(-2, 12, 'ear-left-y')}%)`,
    });
  
    setStyle(['ear-right'], {
      transform: `translateY(${unum(-2, 12, 'ear-right-y')}%)`,
    });
  
    setStyle(['eye-left'], {
      transform: `translateY(${unum(-5, 2, 'eye-left-y')}%)`,
    });
  
    setStyle(['eye-right'], {
      transform: `translateY(${unum(-5, 2, 'eye-right-y')}%)`,
    });
  
    setStyle(['mouth'], {
      transform: `translateY(${unum(-6, 6, 'mouth-y')}%)`,
    });
  
    setStyle(['eye-right-center'], {
      transform: `translate(${unum(-4, 4, 'eye-right-center-y')}%, ${unum(-4, 4, 'eye-right-center-x')}%)`,
      fill: `hsl(${unum(20, 359, 'eye-right-color')}, 100%, 75%)`,
    });
  
    setStyle(['eye-left-center'], {
      transform: `translate(${unum(-4, 4, 'eye-left-center-y')}%, ${unum(-4, 4, 'eye-left-center-x')}%)`,
      fill: `hsl(${unum(20, 359, 'eye-left-color')}, 100%, 75%)`,
    });
  
    // teeth-1 to teeth-10
    for (let i = 1; i <= 10; i++) {
      const name = `teeth-${i}`;
      const isVisible = unum(1, 6, name) % 2 === 0;
      setStyle([name], {
        opacity: isVisible ? 1 : 0,
        fill: undefined,
      });
      // golden teeth
      if (isVisible && unum(1, 100, name) === 50) {
        setStyle([name], {
          fill: '#ffdf22',
        });
      }
    }
  }, [svg, publicKey]);
  return (
    <svg
      className={cx('inline-block', className)}
      viewBox="0 0 200 200"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      ref={svg}
    >
      <g
        id="robot">
        <g
          id="head-group"
          style={{
            transformOrigin: 'bottom',
          }}
        >
          <rect
            fill="#4d4d4d"
            id="neck-center"
            width="10"
            height="30.528244"
            x="95"
            y="156.58838" />
          <rect
            fill="#999999"
            id="neck-top"
            width="30"
            height="35.318295"
            x="85"
            y="121.94701"
            ry="9.1985493" />
          <path
            id="ear-right"
            fill="#4d4d4d"
            d="M 160.75272,86 H 155 V 48 h 5.75272 c 3.46073,0.003 6.2468,2.785712 6.2468,6.246432 v 25.506409 c 0,3.460725 -2.78607,6.249858 -6.2468,6.247159 z" />
          <path
            id="ear-left"
            fill="#4d4d4d"
            d="m 39.246797,48.000002 h 5.752722 v 38 H 39.246797 C 35.786072,85.997002 33,83.21429 33,79.75357 V 54.247161 c 0,-3.460725 2.786072,-6.249858 6.246797,-6.247159 z" />
          <rect
            fill="#b3b3b3"
            id="head-box"
            width="110"
            height="117.02409"
            x="45"
            y="20"
            ry="28.328959" />
          <path
            id="head-line-eye-left"
            fill="#999999"
            d="m 84,20 v 55.000221 c 0,2.77 -2.23,5 -5,5 -2.77,0 -5,-2.23 -5,-5 V 20 Z" />
          <path
            id="head-line-eye-right"
            fill="#999999"
            d="m 126,20 v 55.000221 c 0,2.77 -2.23,5 -5,5 -2.77,0 -5,-2.23 -5,-5 V 20 Z" />
          <path
            id="head-line-mouth"
            fill="#999999"
            d="M 95,137.02522 V 82.025 c 0,-2.77 2.23,-5 4.999997,-5 2.770003,0 5.000003,2.23 5.000003,5 v 55.00022 z" />
          <g
            id="eye-right">
            <rect
              fill="#4d4d4d"
              id="eye-right-hole"
              width="38"
              height="38"
              x="102"
              y="35"
              ry="19" />
            <circle
              fill="#f9f9f9"
              id="eye-right-center"
              cx="121"
              cy="54"
              r="5" />
          </g>
          <g
            id="eye-left">
            <rect
              fill="#4d4d4d"
              id="eye-left-hole"
              width="38"
              height="38"
              x="60"
              y="35"
              ry="19" />
            <circle
              fill="#f9f9f9"
              id="eye-left-center"
              cx="79"
              cy="54"
              r="5" />
          </g>
          <g
            id="mouth">
            <rect
              fill="#4d4d4d"
              id="mouth-hole"
              width="58"
              height="23"
              x="71"
              y="96"
              ry="9.1651554" />
            <path
              id="teeth-3"
              fill="#ffffff"
              d="m 103,96 v 5.58311 c 0,0.78516 -0.63209,1.41725 -1.41725,1.41725 h -3.1655 C 97.63209,103.00036 97,102.36827 97,101.58311 V 96 Z" />
            <path
              id="teeth-4"
              fill="#ffffff"
              d="m 111,96 v 5.58311 c 0,0.78516 -0.63209,1.41725 -1.41725,1.41725 h -3.1655 c -0.78516,0 -1.41725,-0.63209 -1.41725,-1.41725 V 96 Z" />
            <path
              id="teeth-2"
              fill="#ffffff"
              d="m 95,96 v 5.58311 c 0,0.78516 -0.63209,1.41725 -1.41725,1.41725 h -3.1655 C 89.63209,103.00036 89,102.36827 89,101.58311 V 96 Z" />
            <path
              id="teeth-1"
              fill="#ffffff"
              d="m 87,96 v 5.58311 c 0,0.78516 -0.63209,1.41725 -1.41725,1.41725 h -3.1655 C 81.63209,103.00036 81,102.36827 81,101.58311 V 96 Z" />
            <path
              id="teeth-5"
              fill="#ffffff"
              d="m 119,96 v 5.58311 c 0,0.78516 -0.63209,1.41725 -1.41725,1.41725 h -3.1655 c -0.78516,0 -1.41725,-0.63209 -1.41725,-1.41725 V 96 Z" />
            <path
              id="teeth-8"
              fill="#ffffff"
              d="m 97,119.00036 v -5.58311 C 97,112.63209 97.63209,112 98.41725,112 h 3.16549 c 0.78516,0 1.41725,0.63209 1.41725,1.41725 v 5.58311 z" />
            <path
              id="teeth-7"
              fill="#ffffff"
              d="m 89,119.00036 v -5.58311 C 89,112.63209 89.63209,112 90.41725,112 h 3.1655 C 94.36791,112 95,112.63209 95,113.41725 v 5.58311 z" />
            <path
              id="teeth-9"
              fill="#ffffff"
              d="m 104.99999,119.00036 v -5.58311 c 0,-0.78516 0.63209,-1.41725 1.41725,-1.41725 h 3.1655 c 0.78516,0 1.41725,0.63209 1.41725,1.41725 v 5.58311 z" />
            <path
              id="teeth-10"
              fill="#ffffff"
              d="m 112.99999,119.00036 v -5.58311 c 0,-0.78516 0.63209,-1.41725 1.41725,-1.41725 h 3.1655 c 0.78516,0 1.41725,0.63209 1.41725,1.41725 v 5.58311 z" />
            <path
              id="teeth-6"
              fill="#ffffff"
              d="m 81,119.00036 v -5.58311 C 81,112.63209 81.63209,112 82.41725,112 h 3.1655 C 86.36791,112 87,112.63209 87,113.41725 v 5.58311 z" />
          </g>
        </g>
        <path
          id="neck-bottom"
          fill="#999999"
          d="M 92.099216,174 H 107.90078 C 117.37375,174 125,181.62625 125,191.09922 V 200 H 75 v -8.90078 C 75,181.62625 82.626251,174 92.099216,174 Z" />
      </g>
    </svg>
  );
}
