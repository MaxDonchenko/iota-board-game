const adjectives = [
  'Swift',
  'Brave',
  'Clever',
  'Gentle',
  'Fierce',
  'Noble',
  'Wise',
  'Bold',
  'Calm',
  'Bright',
  'Quick',
  'Silent',
  'Proud',
  'Wild',
  'Smooth',
  'Sharp',
  'Tough',
  'Sneaky',
  'Loyal',
  'Happy',
];

const animals = [
  'Tiger',
  'Eagle',
  'Wolf',
  'Bear',
  'Fox',
  'Lion',
  'Hawk',
  'Deer',
  'Owl',
  'Hawk',
  'Falcon',
  'Panther',
  'Raven',
  'Lynx',
  'Jaguar',
  'Cobra',
  'Shark',
  'Dolphin',
  'Stag',
  'Badger',
];

export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}${animal}`;
}
