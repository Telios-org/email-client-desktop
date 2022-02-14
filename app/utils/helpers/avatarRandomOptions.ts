/* eslint-disable no-bitwise */
import {
  theme,
  eyesMap,
  eyebrowsMap,
  mouthsMap,
  hairMap,
  facialHairMap,
  clothingMap,
  accessoryMap,
  graphicsMap,
  hatMap,
  bodyMap
} from '@bigheads/core';

const seedrandom = require('seedrandom');

const selectRandomKey = <T extends {}>(object: T, seed: string) => {
  const rand = seedrandom(seed);
  return (Object.keys(object) as Array<keyof typeof object>)[
    Math.floor(rand() * Object.keys(object).length)
  ];
};

const getRandomOptions = (seed: string) => {
  const seed1 = seed
    .replace('@dev.telios.io', '')
    .replace('@.telios.io', '')
    .substring(0, Math.floor(seed.length / 2));
  const seed2 = seed
    .replace('@dev.telios.io', '')
    .replace('@.telios.io', '')
    .substring(Math.floor(seed.length / 2), seed.length);
  // const seed1 = seed.replace('@dev.telios.io', '').replace('@.telios.io', '');
  // const seed2 = seed.replace('@dev.telios.io', '').replace('@.telios.io', '');

  // Removing the naked option from the random generation
  const clothingDict = { ...clothingMap };
  delete clothingDict.naked;

  const skinTone = selectRandomKey(theme.colors.skin, seed1);
  const eyes = selectRandomKey(eyesMap, seed2);
  const eyebrows = selectRandomKey(eyebrowsMap, seed1);
  const mouth = selectRandomKey(mouthsMap, seed2);
  const hair = selectRandomKey(hairMap, seed1);
  const facialHair = selectRandomKey(facialHairMap, seed2);
  const clothing = selectRandomKey(clothingDict, seed1);
  const accessory = selectRandomKey(accessoryMap, seed2);
  const graphic = 'none';
  const hat = selectRandomKey(hatMap, seed2);
  const body = selectRandomKey(bodyMap, seed1);

  const hairColor = selectRandomKey(theme.colors.hair, seed2);
  const clothingColor = selectRandomKey(theme.colors.clothing, seed1);
  const circleColor = selectRandomKey(theme.colors.bgColors, seed2);
  const lipColor = selectRandomKey(theme.colors.lipColors, seed1);
  const hatColor = selectRandomKey(theme.colors.clothing, seed2);
  const faceMaskColor = selectRandomKey(theme.colors.clothing, seed1);

  const mask = true;
  const faceMask = false;

  const lashes = seedrandom(seed)() > 0.5;

  return {
    skinTone,
    eyes,
    eyebrows,
    mouth,
    hair,
    facialHair,
    clothing,
    accessory,
    graphic,
    hat,
    body,
    hairColor,
    clothingColor,
    circleColor,
    lipColor,
    hatColor,
    faceMaskColor,
    mask,
    faceMask,
    lashes
  };
};

export default getRandomOptions;
