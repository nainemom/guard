import type { SteganographyCollection } from '../lib';
import animal from './assets/animal.json';
import clothing from './assets/clothing.json';
import color from './assets/color.json';
import foodMain from './assets/food-main.json';
import foodSide from './assets/food-side.json';
import nameFirstameFemale from './assets/name-firstname-female.json';
import nameFirstameMale from './assets/name-firstname-male.json';
import nameLastname from './assets/name-lastname.json';
import nameNickname from './assets/name-nickname.json';
import placeCity from './assets/place-city.json';
import relationFemale from './assets/releation-female.json';
import relationGeneral from './assets/releation-general.json';
import relationMale from './assets/releation-male.json';
import timeFuture from './assets/time-future.json';
import transport from './assets/transport.json';

export const persianEverydayCollection: SteganographyCollection = {
  conjuctions: [
    '. ',
    '! ',
    '!\n',
    '.\n',
    ' ولی ',
    ' واسه همین ',
    ' برا همین ',
    ' با اینکه ',
    ' البته ',
    ' درضمن ',
    ' هرچند ',
  ],
  finishers: ['.', '!', '...'],
  templates: [
    [
      [...nameFirstameFemale, ...nameFirstameMale],
      ' ',
      [
        'خنده ش گرفت',
        'پاره شد',
        'ناراحت شد',
        'عصبی شد',
        'عصبانی شد',
        'لفت داد از گروه',
        'زود رسید',
        'دیر میاد',
        'شب میمونه',
        'باید بره',
        'نمیخواست بیاد',
      ],
    ],
    [
      [...nameFirstameFemale, ...nameFirstameMale],
      ' ',
      clothing,
      ' ',
      color,
      ' ',
      ['میپوشه امشب', 'پوشیده بود', 'خرید'],
    ],
    [
      timeFuture,
      ' با ',
      nameFirstameFemale,
      ' میخوایم بریم ',
      ['کافه', 'رستوران', 'باغ', 'قهوه خونه', 'پیک نیک', 'جنگل'],
    ],
    [nameLastname, ' گفت ', transport, ' میره'],
    ['مگه ', placeCity, ' ', animal, ' داره؟'],
    [nameFirstameFemale, ' دیروز ', ['لباشو', 'ناخوناشو'], ' ', color, ' کرد'],
    [nameFirstameMale, ' با ', nameFirstameFemale, ' رفتن ', placeCity],
    [placeCity, ' خیلی ', ['سرد', 'گرم', 'آفتابی', 'یخ', 'تخمی'], 'ه'],
    [
      nameFirstameMale,
      ' ',
      nameNickname,
      ' دیروز ',
      foodMain,
      ' با ',
      foodSide,
      ' خورد',
    ],
    [
      relationMale,
      ' ',
      nameFirstameMale,
      ' ',
      nameNickname,
      ' با ',
      relationFemale,
      ' ',
      nameFirstameFemale,
      ' ',
      ['رل زده', 'میان', 'میرن'],
    ],
    [
      relationGeneral,
      ' ',
      [...nameFirstameMale, ...nameFirstameFemale],
      ' هفته پیش ',
      foodMain,
      ' ',
      ['درست کرد', 'خرید', 'خورد', 'سفارش داد', 'پخت'],
    ],
  ],
};
