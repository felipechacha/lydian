import { LibraryMusic } from '../models/musics.models';

type MusicSeed = readonly [
  title: string,
  artworkUrl: string,
  bpm: number,
  difficulty: LibraryMusic['difficulty'],
  masteryPercentage: number,
  status: LibraryMusic['status'],
];

interface ArtistRepertoire {
  readonly startId: number;
  readonly composer: string;
  readonly techniques: readonly string[];
  readonly technicalFocus: string;
  readonly tracks: readonly MusicSeed[];
}

const ALBUM_ARTWORK_URLS = {
  metallica: {
    killEmAll:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/1c/86/3e/1c863e8a-63df-ce4f-10fe-98b7e9228bd1/Kill_Em_All_HI_RES.jpg/600x600bb.jpg',
    rideTheLightning:
      'https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/0f/7a/74/0f7a7472-92fa-e77d-384a-1e4304705e83/dj.jbiruenb.png/600x600bb.jpg',
    masterOfPuppets:
      'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/69/f9/05/69f905ed-ff04-58a2-8de2-1b5338745f19/858978005226.png/600x600bb.jpg',
    andJusticeForAll:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/c3/65/83/c3658386-7e98-e77c-ac2f-15ea33898bfa/858978005929.png/600x600bb.jpg',
    metallica:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9e/80/1b/9e801b06-67fa-0990-2d15-85480ad3cd46/850007452025.png/600x600bb.jpg',
  },
  gunsNRoses: {
    appetiteForDestruction:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a0/4d/c4/a04dc484-03cc-02aa-fa82-5334fcb4bc16/18UMGIM24878.rgb.jpg/600x600bb.jpg',
    useYourIllusionOne:
      'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/6a/e2/1f/6ae21fa9-c897-3be1-2967-50eefae22b93/06UMGIM05041.rgb.jpg/600x600bb.jpg',
    useYourIllusionTwo:
      'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/db/8e/35/db8e356d-76e8-1e10-d7cb-87870bdbfad2/18UMGIM31437.rgb.jpg/600x600bb.jpg',
    chineseDemocracy:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/cd/7d/bb/cd7dbb63-491a-3d65-0b29-61886ef2cd84/00602517906099.rgb.jpg/600x600bb.jpg',
    theSpaghettiIncident:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/df/7a/f9/df7af97a-8fa5-b02c-e69d-9e4b66e91e81/00602537994533.rgb.jpg/600x600bb.jpg',
  },
  acdc: {
    highVoltage:
      'https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/2d/a8/b5/2da8b582-64aa-d25f-2cdf-ad63a3e04920/dj.jnlhrcpf.jpg/600x600bb.jpg',
    letThereBeRock:
      'https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/d3/26/63/d32663dc-f5a0-090b-d249-fd24cd47a8ab/dj.eynsaemm.jpg/600x600bb.jpg',
    highwayToHell:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b9/c8/ef/b9c8ef42-bbc9-64df-11f8-717571f6730f/886443673458.jpg/600x600bb.jpg',
    backInBlack:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/14/58/1e145814-281a-58e0-3ab1-145f5d1af421/886443673441.jpg/600x600bb.jpg',
    theRazorsEdge:
      'https://is1-ssl.mzstatic.com/image/thumb/Features114/v4/fc/c2/f8/fcc2f850-1d81-7440-c0a0-de7fcef1e911/dj.rrgizfic.jpg/600x600bb.jpg',
  },
  blackSabbath: {
    blackSabbath:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/62/8a/3d/628a3dc3-c862-8641-6306-64d7e7e8960a/075992718523.jpg/600x600bb.jpg',
    paranoid:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/27/91/be279120-2285-16c6-c7ba-9d6643d4a948/075992732727.jpg/600x600bb.jpg',
    masterOfReality:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c2/9f/a1/c29fa109-8c22-bb7f-82f2-a6891d961c28/075992725323.jpg/600x600bb.jpg',
    volumeFour:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/65/68/ac/6568ace4-0c7a-6387-47ed-2f4c3411ff4d/075992725927.jpg/600x600bb.jpg',
    sabbathBloodySabbath:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/7d/9a/2b7d9a86-ff59-f9fe-37ec-363b44f54d18/075992727228.jpg/600x600bb.jpg',
  },
  ironMaiden: {
    ironMaiden:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/61/46/31614655-a6a9-d05f-afe4-06664e9326df/0881034134424.jpg/600x600bb.jpg',
    killers:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7a/d1/0c/7ad10c97-6c8b-f63b-b324-1950718bc9a8/0881034134431.jpg/600x600bb.jpg',
    theNumberOfTheBeast:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1d/cb/ac/1dcbac1b-737d-b7c8-8bed-b5a98ae9df77/0881034134448.jpg/600x600bb.jpg',
    pieceOfMind:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/f8/cd/38/f8cd3816-a840-209a-e9f6-cf3f3e47da21/0881034134455.jpg/600x600bb.jpg',
    powerslave:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2f/8a/c3/2f8ac34f-9e53-e4d3-c0be-195dee1a44ff/0881034134462.jpg/600x600bb.jpg',
  },
  motorhead: {
    overkill:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/19/ae/8d/19ae8dfa-007b-72ce-6274-9d756a3d549e/4050538804935.jpg/600x600bb.jpg',
    bomber:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/85/57/39/85573990-36d8-a000-32bb-f4f1a3d8a59d/4050538804959.jpg/600x600bb.jpg',
    aceOfSpades:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/72/ff/c0/72ffc005-173a-c581-697a-351bef24458d/4050538652017.jpg/600x600bb.jpg',
    ironFist:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/62/44/18/6244184b-d782-1f94-e3cb-12ec1203ac2b/4050538805017.jpg/600x600bb.jpg',
    orgasmatron:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/02/a7/5c/02a75c81-6be7-3143-64c8-1f5adfc77f1a/4050538789034.jpg/600x600bb.jpg',
  },
  ozzyOsbourne: {
    blizzardOfOzz:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/92/06/bd/9206bdb3-453a-db69-44f4-c4b5bfe33510/886448748045.jpg/600x600bb.jpg',
    diaryOfAMadman:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/68/5d/b6/685db61f-ea79-a16a-f1c4-a86cab8e0311/886449629367.jpg/600x600bb.jpg',
    barkAtTheMoon:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/9c/2b/93/9c2b933c-c0de-689e-0b7c-ccadf7649954/696998542921.jpg/600x600bb.jpg',
    theUltimateSin:
      'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/02/8c/1a/028c1ac0-06c9-8927-3cef-c173cc044dfb/074646723920.jpg/600x600bb.jpg',
    noMoreTears:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8e/ef/44/8eef4402-508e-860e-a3c0-9be46cf2379e/696998524828.jpg/600x600bb.jpg',
  },
  judasPriest: {
    sadWingsOfDestiny:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/30/eb/13/30eb139b-f8d7-83d0-4198-483ba65dd8c8/5195.jpg/600x600bb.jpg',
    stainedClass:
      'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/c3/67/7b/c3677b3a-5588-97a6-cbce-001588713824/dj.xwtprxem.jpg/600x600bb.jpg',
    britishSteel:
      'https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/3e/ce/c7/3ecec7e6-66a3-7ca8-d70f-5a4512aa21ba/dj.stjulnox.jpg/600x600bb.jpg',
    screamingForVengeance:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/74/85/6c/74856c38-ad00-adfe-4041-e433b1b097b2/dj.msxviebt.jpg/600x600bb.jpg',
    painkiller:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d0/f4/d9/d0f4d907-d333-1c26-703d-7245a348a519/dj.xjjnnhmb.jpg/600x600bb.jpg',
  },
  dio: {
    holyDiver:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e4/8e/9a/e48e9aa6-1488-8b71-82eb-0b856d1034d2/mzm.txbqniop.jpg/600x600bb.jpg',
    theLastInLine:
      'https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/e9/9a/d4/e99ad43f-c8ca-cce9-3014-f56f03680c03/603497876419.jpg/600x600bb.jpg',
    sacredHeart:
      'https://is1-ssl.mzstatic.com/image/thumb/Music20/v4/d8/b4/c5/d8b4c5a5-1a85-5632-82c8-1cdc28b259a7/603497872695.jpg/600x600bb.jpg',
    dreamEvil:
      'https://is1-ssl.mzstatic.com/image/thumb/Music30/v4/9d/05/c5/9d05c5ae-9899-0200-5542-01376ee3736f/603497873111.jpg/600x600bb.jpg',
    lockUpTheWolves:
      'https://is1-ssl.mzstatic.com/image/thumb/Music/be/33/fb/mzi.zxjvuqmd.jpg/600x600bb.jpg',
  },
  megadeth: {
    peaceSells:
      'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/38/eb/22/38eb2239-25be-c219-b8c8-aa9853c91032/00602547895011.rgb.jpg/600x600bb.jpg',
    soFarSoGoodSoWhat:
      'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/8d/1f/ee/8d1feead-37a0-3f26-d443-ab045eb7f85e/13UABIM36481.rgb.jpg/600x600bb.jpg',
    rustInPeace:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/df/fe/a7/dffea722-e8d7-b2ac-2b31-e207fb738b8e/13UABIM36806.rgb.jpg/600x600bb.jpg',
    countdownToExtinction:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/41/90/ca/4190ca89-8a22-7ccc-4183-f6556f04ca80/23UMGIM14872.rgb.jpg/600x600bb.jpg',
    youthanasia:
      'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1a/fc/9f/1afc9f2b-9297-1670-ee64-a0fc547857e0/19UMGIM16960.rgb.jpg/600x600bb.jpg',
  },
  pantera: {
    cowboysFromHell:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2e/60/52/2e605210-1bc5-f905-74f0-8c8410964914/603497872046.jpg/600x600bb.jpg',
    vulgarDisplayOfPower:
      'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/12/c4/89/12c489fe-4ec2-8eed-2bdb-fbeb50c2cc46/603497886005.jpg/600x600bb.jpg',
    farBeyondDriven:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1b/be/ad/1bbeada3-535f-206f-2662-37d785dca492/603497872404.jpg/600x600bb.jpg',
    theGreatSouthernTrendkill:
      'https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/c9/3c/8d/c93c8de0-5020-4483-5fc3-e3ed12f44db4/603497879847.jpg/600x600bb.jpg',
    reinventingTheSteel:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/d0/fe/88/d0fe8849-4446-4346-4b4d-16de863b2d97/603497872398.jpg/600x600bb.jpg',
  },
  ledZeppelin: {
    ledZeppelin:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/4c/7b/80/4c7b80b4-ed35-4e06-ec80-2f7aaaabb5c5/dj.pjjmtwdc.jpg/600x600bb.jpg',
    ledZeppelinTwo:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1a/3d/bb/1a3dbb86-c1f8-737e-571f-d6b647a230be/dj.rhubuvkd.jpg/600x600bb.jpg',
    ledZeppelinThree:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/62/fd/14/62fd14aa-d202-a86a-d948-0a5550b35fc3/dj.rkzuiqye.jpg/600x600bb.jpg',
    ledZeppelinFour:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5c/15/9b/5c159b27-95ca-b9a7-84e3-28e795fffd39/dj.kvkrpptq.jpg/600x600bb.jpg',
    physicalGraffiti:
      'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/82/6c/5d/826c5d66-67b7-62f2-4d78-dd3c7b415e08/dj.pifhrvpa.jpg/600x600bb.jpg',
  },
} as const;

const ARTIST_REPERTOIRES: readonly ArtistRepertoire[] = [
  {
    startId: 1,
    composer: 'Metallica',
    techniques: ['Palm Mute', 'Downpicking', 'Alternate Picking', 'Power Chords', 'Slides'],
    technicalFocus: 'Consistência do palm mute, precisão dos riffs e controle de dinâmica.',
    tracks: [
      ['Hit the Lights', ALBUM_ARTWORK_URLS.metallica.killEmAll, 160, 'Médio', 54, 'practicing'],
      [
        'For Whom the Bell Tolls',
        ALBUM_ARTWORK_URLS.metallica.rideTheLightning,
        118,
        'Médio',
        76,
        'practicing',
      ],
      [
        'Master of Puppets',
        ALBUM_ARTWORK_URLS.metallica.masterOfPuppets,
        212,
        'Difícil',
        42,
        'learning',
      ],
      ['One', ALBUM_ARTWORK_URLS.metallica.andJusticeForAll, 103, 'Difícil', 68, 'practicing'],
      ['Enter Sandman', ALBUM_ARTWORK_URLS.metallica.metallica, 123, 'Médio', 100, 'mastered'],
    ],
  },
  {
    startId: 6,
    composer: "Guns N' Roses",
    techniques: ['String Skipping', 'Bends', 'Vibrato', 'Legato', 'Arpejos'],
    technicalFocus: 'Clareza nos arpejos, afinação dos bends e fluidez dos solos.',
    tracks: [
      [
        'Welcome to the Jungle',
        ALBUM_ARTWORK_URLS.gunsNRoses.appetiteForDestruction,
        124,
        'Difícil',
        55,
        'practicing',
      ],
      [
        'November Rain',
        ALBUM_ARTWORK_URLS.gunsNRoses.useYourIllusionOne,
        80,
        'Difícil',
        71,
        'practicing',
      ],
      [
        'Civil War',
        ALBUM_ARTWORK_URLS.gunsNRoses.useYourIllusionTwo,
        80,
        'Difícil',
        48,
        'learning',
      ],
      [
        'Chinese Democracy',
        ALBUM_ARTWORK_URLS.gunsNRoses.chineseDemocracy,
        133,
        'Médio',
        38,
        'learning',
      ],
      [
        "Since I Don't Have You",
        ALBUM_ARTWORK_URLS.gunsNRoses.theSpaghettiIncident,
        118,
        'Médio',
        64,
        'practicing',
      ],
    ],
  },
  {
    startId: 11,
    composer: 'AC/DC',
    techniques: ['Groove', 'Acordes Abertos', 'Muting', 'Bends', 'Dinâmica'],
    technicalFocus: 'Groove firme, ataques precisos e silêncios bem definidos entre acordes.',
    tracks: [
      ['T.N.T.', ALBUM_ARTWORK_URLS.acdc.highVoltage, 126, 'Fácil', 82, 'practicing'],
      ['Whole Lotta Rosie', ALBUM_ARTWORK_URLS.acdc.letThereBeRock, 160, 'Médio', 63, 'practicing'],
      ['Highway to Hell', ALBUM_ARTWORK_URLS.acdc.highwayToHell, 116, 'Fácil', 91, 'mastered'],
      ['Back in Black', ALBUM_ARTWORK_URLS.acdc.backInBlack, 94, 'Fácil', 100, 'mastered'],
      ['Thunderstruck', ALBUM_ARTWORK_URLS.acdc.theRazorsEdge, 134, 'Difícil', 57, 'practicing'],
    ],
  },
  {
    startId: 16,
    composer: 'Black Sabbath',
    techniques: ['Power Chords', 'Alternate Picking', 'Riffing', 'Bends', 'Staccato'],
    technicalFocus: 'Peso dos riffs, estabilidade de tempo e articulação dos ataques curtos.',
    tracks: [
      ['N.I.B.', ALBUM_ARTWORK_URLS.blackSabbath.blackSabbath, 102, 'Médio', 65, 'practicing'],
      ['Paranoid', ALBUM_ARTWORK_URLS.blackSabbath.paranoid, 163, 'Médio', 88, 'practicing'],
      [
        'Children of the Grave',
        ALBUM_ARTWORK_URLS.blackSabbath.masterOfReality,
        128,
        'Difícil',
        44,
        'learning',
      ],
      ['Changes', ALBUM_ARTWORK_URLS.blackSabbath.volumeFour, 85, 'Fácil', 73, 'practicing'],
      [
        'Sabbath Bloody Sabbath',
        ALBUM_ARTWORK_URLS.blackSabbath.sabbathBloodySabbath,
        130,
        'Difícil',
        52,
        'practicing',
      ],
    ],
  },
  {
    startId: 21,
    composer: 'Iron Maiden',
    techniques: ['Gallop', 'Alternate Picking', 'Hammer-on', 'Pull-off', 'Duas Guitarras'],
    technicalFocus: 'Regularidade no gallop e sincronismo das linhas de guitarra harmonizadas.',
    tracks: [
      [
        'Phantom of the Opera',
        ALBUM_ARTWORK_URLS.ironMaiden.ironMaiden,
        108,
        'Difícil',
        46,
        'learning',
      ],
      ['Wrathchild', ALBUM_ARTWORK_URLS.ironMaiden.killers, 134, 'Médio', 62, 'practicing'],
      [
        'The Number of the Beast',
        ALBUM_ARTWORK_URLS.ironMaiden.theNumberOfTheBeast,
        100,
        'Difícil',
        74,
        'practicing',
      ],
      ['The Trooper', ALBUM_ARTWORK_URLS.ironMaiden.pieceOfMind, 160, 'Difícil', 58, 'practicing'],
      ['Aces High', ALBUM_ARTWORK_URLS.ironMaiden.powerslave, 130, 'Difícil', 39, 'learning'],
    ],
  },
  {
    startId: 26,
    composer: 'Motörhead',
    techniques: ['Power Chords', 'Downpicking', 'Riffing', 'Bends', 'Velocidade'],
    technicalFocus: 'Resistência de palhetada e controle dos riffs em alta velocidade.',
    tracks: [
      ['Overkill', ALBUM_ARTWORK_URLS.motorhead.overkill, 144, 'Difícil', 43, 'learning'],
      ['Bomber', ALBUM_ARTWORK_URLS.motorhead.bomber, 127, 'Médio', 57, 'practicing'],
      ['Ace of Spades', ALBUM_ARTWORK_URLS.motorhead.aceOfSpades, 140, 'Médio', 76, 'practicing'],
      ['Iron Fist', ALBUM_ARTWORK_URLS.motorhead.ironFist, 175, 'Difícil', 35, 'learning'],
      ['Deaf Forever', ALBUM_ARTWORK_URLS.motorhead.orgasmatron, 130, 'Médio', 68, 'practicing'],
    ],
  },
  {
    startId: 31,
    composer: 'Ozzy Osbourne',
    techniques: ['Alternate Picking', 'Tapping', 'Legato', 'Bends', 'Vibrato'],
    technicalFocus: 'Articulação limpa dos riffs e controle expressivo dos ligados e bends.',
    tracks: [
      [
        'Crazy Train',
        ALBUM_ARTWORK_URLS.ozzyOsbourne.blizzardOfOzz,
        138,
        'Difícil',
        71,
        'practicing',
      ],
      [
        'Over the Mountain',
        ALBUM_ARTWORK_URLS.ozzyOsbourne.diaryOfAMadman,
        130,
        'Difícil',
        58,
        'practicing',
      ],
      [
        'Bark at the Moon',
        ALBUM_ARTWORK_URLS.ozzyOsbourne.barkAtTheMoon,
        148,
        'Difícil',
        42,
        'learning',
      ],
      [
        'Shot in the Dark',
        ALBUM_ARTWORK_URLS.ozzyOsbourne.theUltimateSin,
        111,
        'Médio',
        65,
        'practicing',
      ],
      [
        'No More Tears',
        ALBUM_ARTWORK_URLS.ozzyOsbourne.noMoreTears,
        103,
        'Médio',
        84,
        'practicing',
      ],
    ],
  },
  {
    startId: 36,
    composer: 'Judas Priest',
    techniques: ['Power Chords', 'Palm Mute', 'Downpicking', 'Riffing', 'Groove'],
    technicalFocus: 'Ataques secos e precisos sincronizados com a seção rítmica.',
    tracks: [
      [
        'Victim of Changes',
        ALBUM_ARTWORK_URLS.judasPriest.sadWingsOfDestiny,
        85,
        'Difícil',
        48,
        'learning',
      ],
      ['Exciter', ALBUM_ARTWORK_URLS.judasPriest.stainedClass, 170, 'Difícil', 39, 'learning'],
      [
        'Breaking the Law',
        ALBUM_ARTWORK_URLS.judasPriest.britishSteel,
        164,
        'Fácil',
        100,
        'mastered',
      ],
      [
        "You've Got Another Thing Comin'",
        ALBUM_ARTWORK_URLS.judasPriest.screamingForVengeance,
        113,
        'Médio',
        78,
        'practicing',
      ],
      ['Painkiller', ALBUM_ARTWORK_URLS.judasPriest.painkiller, 104, 'Difícil', 34, 'learning'],
    ],
  },
  {
    startId: 41,
    composer: 'Dio',
    techniques: ['Power Chords', 'Riffs', 'Sustain', 'Bends', 'Vibrato'],
    technicalFocus: 'Sustain consistente, riffs definidos e frases com vibrato controlado.',
    tracks: [
      ['Holy Diver', ALBUM_ARTWORK_URLS.dio.holyDiver, 90, 'Médio', 86, 'practicing'],
      ['We Rock', ALBUM_ARTWORK_URLS.dio.theLastInLine, 168, 'Difícil', 54, 'practicing'],
      [
        "Rock 'n' Roll Children",
        ALBUM_ARTWORK_URLS.dio.sacredHeart,
        127,
        'Médio',
        63,
        'practicing',
      ],
      [
        'I Could Have Been a Dreamer',
        ALBUM_ARTWORK_URLS.dio.dreamEvil,
        123,
        'Médio',
        41,
        'learning',
      ],
      ['Wild One', ALBUM_ARTWORK_URLS.dio.lockUpTheWolves, 148, 'Difícil', 32, 'learning'],
    ],
  },
  {
    startId: 46,
    composer: 'Megadeth',
    techniques: ['Alternate Picking', 'Thrash Riffing', 'Palm Mute', 'Mudanças de Compasso'],
    technicalFocus: 'Precisão em alta velocidade e transições limpas entre riffs complexos.',
    tracks: [
      ['Peace Sells', ALBUM_ARTWORK_URLS.megadeth.peaceSells, 140, 'Difícil', 66, 'practicing'],
      [
        'In My Darkest Hour',
        ALBUM_ARTWORK_URLS.megadeth.soFarSoGoodSoWhat,
        100,
        'Difícil',
        47,
        'learning',
      ],
      [
        'Holy Wars... The Punishment Due',
        ALBUM_ARTWORK_URLS.megadeth.rustInPeace,
        166,
        'Difícil',
        58,
        'practicing',
      ],
      [
        'Symphony of Destruction',
        ALBUM_ARTWORK_URLS.megadeth.countdownToExtinction,
        139,
        'Médio',
        81,
        'practicing',
      ],
      ['A Tout Le Monde', ALBUM_ARTWORK_URLS.megadeth.youthanasia, 100, 'Médio', 72, 'practicing'],
    ],
  },
  {
    startId: 51,
    composer: 'Pantera',
    techniques: ['Groove Metal', 'Palm Mute', 'Pinch Harmonics', 'Bends', 'Shredding'],
    technicalFocus: 'Peso rítmico, síncopes precisas e controle dos harmônicos artificiais.',
    tracks: [
      [
        'Cowboys from Hell',
        ALBUM_ARTWORK_URLS.pantera.cowboysFromHell,
        114,
        'Difícil',
        76,
        'practicing',
      ],
      [
        'Mouth for War',
        ALBUM_ARTWORK_URLS.pantera.vulgarDisplayOfPower,
        136,
        'Difícil',
        62,
        'practicing',
      ],
      ["I'm Broken", ALBUM_ARTWORK_URLS.pantera.farBeyondDriven, 126, 'Difícil', 55, 'practicing'],
      [
        'Drag the Waters',
        ALBUM_ARTWORK_URLS.pantera.theGreatSouthernTrendkill,
        96,
        'Difícil',
        43,
        'learning',
      ],
      [
        'Goddamn Electric',
        ALBUM_ARTWORK_URLS.pantera.reinventingTheSteel,
        105,
        'Difícil',
        38,
        'learning',
      ],
    ],
  },
  {
    startId: 56,
    composer: 'Led Zeppelin',
    techniques: ['Riffs Clássicos', 'Fingerpicking', 'Bends', 'Dinâmica', 'Acordes Abertos'],
    technicalFocus: 'Dinâmica, controle de tempo e articulação expressiva dos riffs.',
    tracks: [
      [
        'Good Times Bad Times',
        ALBUM_ARTWORK_URLS.ledZeppelin.ledZeppelin,
        93,
        'Médio',
        78,
        'practicing',
      ],
      [
        'Whole Lotta Love',
        ALBUM_ARTWORK_URLS.ledZeppelin.ledZeppelinTwo,
        89,
        'Médio',
        100,
        'mastered',
      ],
      [
        'Immigrant Song',
        ALBUM_ARTWORK_URLS.ledZeppelin.ledZeppelinThree,
        113,
        'Médio',
        84,
        'practicing',
      ],
      ['Black Dog', ALBUM_ARTWORK_URLS.ledZeppelin.ledZeppelinFour, 81, 'Médio', 88, 'practicing'],
      ['Kashmir', ALBUM_ARTWORK_URLS.ledZeppelin.physicalGraffiti, 82, 'Difícil', 67, 'practicing'],
    ],
  },
];

export const LIBRARY_MUSICS: readonly LibraryMusic[] = ARTIST_REPERTOIRES.flatMap(
  ({ startId, composer, techniques, technicalFocus, tracks }) =>
    tracks.map(([title, artworkUrl, bpm, difficulty, masteryPercentage, status], trackIndex) => ({
      id: startId + trackIndex,
      title,
      composer,
      artworkUrl,
      bpm,
      difficulty,
      masteryPercentage,
      status,
      techniques,
      technicalFocus,
    })),
);
