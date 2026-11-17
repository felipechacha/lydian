import { MusicSearchResult } from '../models/add-music.models';

export const MUSIC_SEARCH_RESULTS: readonly MusicSearchResult[] = [
  {
    id: 101,
    title: 'Master of Puppets',
    composer: 'Metallica',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/b8/5a/82/b85a8259-60d9-bfaa-770a-2baac8380e87/858978005196.png/600x600bb.jpg',
    bpm: 212,
    key: 'Mi Menor',
    capo: 0,
    tuning: 'E Standard',
    difficulty: 'Avançado',
    difficultyLevel: 3,
    techniques: ['Downpicking', 'Palm Mute', 'Mudanças de Compasso'],
  },
  {
    id: 102,
    title: 'Welcome to the Jungle',
    composer: "Guns N' Roses",
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/56/47/b7/5647b700-6b9d-9e72-ec9f-51140b6d4492/00602567673781.rgb.jpg/600x600bb.jpg',
    bpm: 124,
    key: 'Mi Bemol Menor',
    capo: 0,
    tuning: 'Eb Standard',
    difficulty: 'Avançado',
    difficultyLevel: 3,
    techniques: ['Alternate Picking', 'Bends', 'Riffs com Pedal Tone'],
  },
  {
    id: 103,
    title: 'Highway to Hell',
    composer: 'AC/DC',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b9/c8/ef/b9c8ef42-bbc9-64df-11f8-717571f6730f/886443673458.jpg/600x600bb.jpg',
    bpm: 116,
    key: 'Lá Maior',
    capo: 0,
    tuning: 'E Standard',
    difficulty: 'Intermediário',
    difficultyLevel: 2,
    techniques: ['Power Chords', 'Groove', 'Bends'],
  },
  {
    id: 104,
    title: 'Holy Diver',
    composer: 'Dio',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e4/8e/9a/e48e9aa6-1488-8b71-82eb-0b856d1034d2/mzm.txbqniop.jpg/600x600bb.jpg',
    bpm: 90,
    key: 'Dó Menor',
    capo: 0,
    tuning: 'E Standard',
    difficulty: 'Intermediário',
    difficultyLevel: 2,
    techniques: ['Power Chords', 'Riffs', 'Sustain'],
  },
];
