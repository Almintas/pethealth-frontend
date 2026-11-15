export const PET_SPECIES_SUGGESTIONS = [
  'Dog',
  'Cat',
  'Rabbit',
  'Guinea Pig',
  'Hamster',
  'Bird',
  'Fish',
  'Reptile',
  'Other',
] as const;

export const PET_GENDER_SUGGESTIONS = [
  'Male',
  'Female',
  'Unknown',
  'Not specified',
] as const;

/** Dedupe and sort A–Z, keeping priority labels at the top in order. */
function orderBreedSuggestions(
  breeds: readonly string[],
  priorityTop: readonly string[],
): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const breed of breeds) {
    const key = breed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(breed);
    }
  }

  const priorityLower = new Set(priorityTop.map((label) => label.toLowerCase()));
  const top = priorityTop.filter((label) =>
    unique.some((breed) => breed.toLowerCase() === label.toLowerCase()),
  );
  const rest = unique
    .filter((breed) => !priorityLower.has(breed.toLowerCase()))
    .sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: 'base' }),
    );

  return [...top, ...rest];
}

const DOG_BREEDS = orderBreedSuggestions(
  [
    'Mixed Breed',
    'Affenpinscher',
    'Afghan Hound',
    'Akita',
    'Alaskan Malamute',
    'American Bulldog',
    'American Pit Bull Terrier',
    'Australian Cattle Dog',
    'Australian Shepherd',
    'Basenji',
    'Basset Hound',
    'Beagle',
    'Belgian Malinois',
    'Bernese Mountain Dog',
    'Bichon Frise',
    'Border Collie',
    'Boston Terrier',
    'Boxer',
    'Brittany',
    'Bulldog',
    'Bull Terrier',
    'Cane Corso',
    'Cavalier King Charles Spaniel',
    'Chihuahua',
    'Chinese Crested',
    'Chow Chow',
    'Cocker Spaniel',
    'Collie',
    'Corgi',
    'Dachshund',
    'Dalmatian',
    'Doberman',
    'English Setter',
    'English Springer Spaniel',
    'French Bulldog',
    'German Shepherd',
    'German Shorthaired Pointer',
    'Golden Retriever',
    'Great Dane',
    'Greyhound',
    'Havanese',
    'Irish Setter',
    'Jack Russell Terrier',
    'Labrador Retriever',
    'Leonberger',
    'Lhasa Apso',
    'Maltese',
    'Miniature Pinscher',
    'Miniature Schnauzer',
    'Newfoundland',
    'Papillon',
    'Pekingese',
    'Pointer',
    'Pomeranian',
    'Poodle',
    'Miniature Poodle',
    'Toy Poodle',
    'Pug',
    'Rottweiler',
    'Saint Bernard',
    'Samoyed',
    'Schnauzer',
    'Giant Schnauzer',
    'Scottish Terrier',
    'Shar Pei',
    'Shiba Inu',
    'Shih Tzu',
    'Siberian Husky',
    'Staffordshire Bull Terrier',
    'Vizsla',
    'Weimaraner',
    'West Highland White Terrier',
    'Whippet',
    'Yorkshire Terrier',
  ],
  ['Mixed Breed'],
);

const CAT_BREEDS = orderBreedSuggestions(
  [
    'Mixed',
    'Domestic Shorthair',
    'Domestic Longhair',
    'Abyssinian',
    'American Bobtail',
    'American Shorthair',
    'Bengal',
    'Birman',
    'Bombay',
    'British Shorthair',
    'Burmese',
    'Burmilla',
    'Cornish Rex',
    'Devon Rex',
    'Egyptian Mau',
    'Exotic Shorthair',
    'Himalayan',
    'Japanese Bobtail',
    'Maine Coon',
    'Manx',
    'Norwegian Forest Cat',
    'Ocicat',
    'Oriental Shorthair',
    'Persian',
    'Ragdoll',
    'Russian Blue',
    'Savannah',
    'Scottish Fold',
    'Scottish Straight',
    'Siamese',
    'Siberian',
    'Singapura',
    'Somali',
    'Sphynx',
    'Thai',
    'Tonkinese',
    'Turkish Angora',
    'Turkish Van',
  ],
  ['Mixed', 'Domestic Shorthair', 'Domestic Longhair'],
);

const RABBIT_BREEDS = orderBreedSuggestions(
  [
    'Mixed',
    'Californian',
    'Dutch',
    'English Angora',
    'English Spot',
    'Flemish Giant',
    'French Lop',
    'Harlequin',
    'Holland Lop',
    'Lionhead',
    'Mini Lop',
    'Mini Rex',
    'Netherland Dwarf',
    'Rex',
  ],
  ['Mixed'],
);

const GUINEA_PIG_BREEDS = orderBreedSuggestions(
  [
    'Mixed',
    'American',
    'Abyssinian',
    'Coronet',
    'Peruvian',
    'Rex',
    'Silkie',
    'Skinny',
    'Teddy',
    'Texel',
  ],
  ['Mixed'],
);

const HAMSTER_BREEDS = orderBreedSuggestions(
  [
    "Campbell's Dwarf",
    'Chinese',
    'Hybrid Dwarf',
    'Roborovski',
    'Syrian',
    'Winter White',
  ],
  ['Syrian'],
);

const BIRD_BREEDS = orderBreedSuggestions(
  [
    'Mixed / Unknown',
    'African Grey Parrot',
    'Amazon Parrot',
    'Budgerigar',
    'Canary',
    'Cockatiel',
    'Cockatoo',
    'Conure',
    'Eclectus Parrot',
    'Finch',
    'Lovebird',
    'Macaw',
  ],
  ['Mixed / Unknown'],
);

const FISH_BREEDS = orderBreedSuggestions(
  [
    'Mixed / Community',
    'Angelfish',
    'Betta',
    'Discus',
    'Goldfish',
    'Guppy',
    'Koi',
    'Molly',
    'Neon Tetra',
    'Oscar',
    'Platy',
    'Swordtail',
    'Zebra Danio',
  ],
  ['Mixed / Community'],
);

const REPTILE_BREEDS = orderBreedSuggestions(
  [
    'Mixed / Unknown',
    'Ball Python',
    'Bearded Dragon',
    'Blue-Tongued Skink',
    'Corn Snake',
    'Crested Gecko',
    'Greek Tortoise',
    'King Snake',
    'Leopard Gecko',
    'Red-Eared Slider',
    'Russian Tortoise',
  ],
  ['Mixed / Unknown'],
);

const OTHER_BREEDS = orderBreedSuggestions(
  ['Mixed', 'Unknown', 'Other (custom)'],
  ['Mixed', 'Unknown', 'Other (custom)'],
);

const BREEDS_BY_SPECIES: Record<string, string[]> = {
  Dog: DOG_BREEDS,
  Cat: CAT_BREEDS,
  Rabbit: RABBIT_BREEDS,
  'Guinea Pig': GUINEA_PIG_BREEDS,
  Hamster: HAMSTER_BREEDS,
  Bird: BIRD_BREEDS,
  Fish: FISH_BREEDS,
  Reptile: REPTILE_BREEDS,
  Other: OTHER_BREEDS,
};

const DEFAULT_BREED_SUGGESTIONS = orderBreedSuggestions(
  ['Mixed', 'Unknown'],
  ['Mixed', 'Unknown'],
);

function collectAllBreedSuggestionValues(): string[] {
  const values = new Set<string>();
  for (const breeds of Object.values(BREEDS_BY_SPECIES)) {
    for (const breed of breeds) {
      values.add(breed);
    }
  }
  for (const breed of DEFAULT_BREED_SUGGESTIONS) {
    values.add(breed);
  }
  return [...values];
}

/** All canonical breed strings used in suggestion lists (for i18n coverage checks). */
export const ALL_BREED_SUGGESTION_VALUES = collectAllBreedSuggestionValues();

export function getBreedSuggestionsForSpecies(species: string): string[] {
  const normalized = species.trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_BREED_SUGGESTIONS;
  }

  const match = Object.entries(BREEDS_BY_SPECIES).find(
    ([key]) => key.toLowerCase() === normalized,
  );

  if (match) {
    return match[1];
  }

  if (normalized.includes('dog')) {
    return BREEDS_BY_SPECIES.Dog;
  }
  if (normalized.includes('cat')) {
    return BREEDS_BY_SPECIES.Cat;
  }
  if (normalized.includes('rabbit')) {
    return BREEDS_BY_SPECIES.Rabbit;
  }
  if (normalized.includes('guinea')) {
    return BREEDS_BY_SPECIES['Guinea Pig'];
  }
  if (normalized.includes('hamster')) {
    return BREEDS_BY_SPECIES.Hamster;
  }
  if (normalized.includes('bird')) {
    return BREEDS_BY_SPECIES.Bird;
  }
  if (normalized.includes('fish')) {
    return BREEDS_BY_SPECIES.Fish;
  }
  if (normalized.includes('reptile')) {
    return BREEDS_BY_SPECIES.Reptile;
  }

  return DEFAULT_BREED_SUGGESTIONS;
}
