import { NextResponse } from 'next/server';

// African Slangs Database - Diverse collection from across the continent
const africanSlangs = [
  // Nigeria 🇳🇬
  {
    id: 'ng-1',
    slang: 'Wahala',
    meaning: 'Trouble, problem, or complication. Used when something is difficult or stressful.',
    example: '"This traffic is too much wahala!"',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    pronunciation: 'wah-HAH-lah',
    category: 'Expression'
  },
  {
    id: 'ng-2',
    slang: 'Oga',
    meaning: 'Boss, master, or someone in charge. A term of respect for authority figures.',
    example: '"Oga, please help me with this matter."',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    pronunciation: 'OH-gah',
    category: 'Title'
  },
  {
    id: 'ng-3',
    slang: 'Sabi',
    meaning: 'To know or understand something. Also means being skilled at something.',
    example: '"You sabi cook well well!"',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    pronunciation: 'SAH-bee',
    category: 'Verb'
  },
  {
    id: 'ng-4',
    slang: 'Japa',
    meaning: 'To run away or escape, especially emigrating abroad for better opportunities.',
    example: '"Many youths are planning to japa to Canada."',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    pronunciation: 'JAH-pah',
    category: 'Verb'
  },
  {
    id: 'ng-5',
    slang: 'Ginger',
    meaning: 'To hype up, motivate, or encourage someone. Also means excitement.',
    example: '"This song really gingers me!"',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    pronunciation: 'JIN-jah',
    category: 'Verb'
  },
  {
    id: 'ng-6',
    slang: 'Na you sabi',
    meaning: 'It\'s your choice/problem. An expression of indifference to someone\'s decision.',
    example: '"If you don\'t want to come, na you sabi."',
    country: 'Nigeria',
    countryCode: 'NG',
    flag: '🇳🇬',
    pronunciation: 'nah-yoo-SAH-bee',
    category: 'Expression'
  },

  // South Africa 🇿🇦
  {
    id: 'za-1',
    slang: 'Eish',
    meaning: 'An expression of surprise, frustration, or disbelief. Very versatile exclamation.',
    example: '"Eish, the power is out again!"',
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    pronunciation: 'AY-sh',
    category: 'Exclamation'
  },
  {
    id: 'za-2',
    slang: 'Sharp sharp',
    meaning: 'Goodbye, okay, or everything is fine. A casual farewell or agreement.',
    example: '"I\'ll see you tomorrow, sharp sharp!"',
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    pronunciation: 'shahp-shahp',
    category: 'Greeting'
  },
  {
    id: 'za-3',
    slang: 'Lekker',
    meaning: 'Nice, great, delicious, or pleasant. Used to describe anything enjoyable.',
    example: '"That braai was lekker, bru!"',
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    pronunciation: 'LEK-kah',
    category: 'Adjective'
  },
  {
    id: 'za-4',
    slang: 'Heita',
    meaning: 'Hello or hi. A casual, friendly greeting popular in townships.',
    example: '"Heita, my friend! How are you?"',
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    pronunciation: 'HAY-tah',
    category: 'Greeting'
  },
  {
    id: 'za-5',
    slang: 'Braai',
    meaning: 'A South African barbecue. A social gathering centered around grilling meat.',
    example: '"Come over for a braai this weekend!"',
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    pronunciation: 'br-EYE',
    category: 'Noun'
  },
  {
    id: 'za-6',
    slang: 'Yebo',
    meaning: 'Yes in Zulu. Used widely across South Africa as an affirmation.',
    example: '"Are you coming? Yebo!"',
    country: 'South Africa',
    countryCode: 'ZA',
    flag: '🇿🇦',
    pronunciation: 'YEH-boh',
    category: 'Affirmation'
  },

  // Ghana 🇬🇭
  {
    id: 'gh-1',
    slang: 'Chale',
    meaning: 'Friend, buddy, or mate. A very common term of endearment in Ghana.',
    example: '"Chale, what\'s up?"',
    country: 'Ghana',
    countryCode: 'GH',
    flag: '🇬🇭',
    pronunciation: 'CHAH-lay',
    category: 'Noun'
  },
  {
    id: 'gh-2',
    slang: 'Aswear',
    meaning: 'I swear / Are you serious? Used to express disbelief or emphasis.',
    example: '"Aswear, this food is delicious!"',
    country: 'Ghana',
    countryCode: 'GH',
    flag: '🇬🇭',
    pronunciation: 'ah-SWEAR',
    category: 'Expression'
  },
  {
    id: 'gh-3',
    slang: 'Wo maame',
    meaning: 'An expression meaning "your mother" - can be affectionate or an insult depending on context.',
    example: '"Wo maame tw3!" (playful insult among friends)',
    country: 'Ghana',
    countryCode: 'GH',
    flag: '🇬🇭',
    pronunciation: 'woh-MAH-may',
    category: 'Expression'
  },
  {
    id: 'gh-4',
    slang: 'Kwasia',
    meaning: 'A fool or stupid person. Used as a playful insult among friends.',
    example: '"You be kwasia!" (You\'re being silly)',
    country: 'Ghana',
    countryCode: 'GH',
    flag: '🇬🇭',
    pronunciation: 'KWAH-see-ah',
    category: 'Noun'
  },

  // Kenya 🇰🇪
  {
    id: 'ke-1',
    slang: 'Poa',
    meaning: 'Cool, fine, or okay. A positive response meaning everything is good.',
    example: '"How are you?" "Poa sana!"',
    country: 'Kenya',
    countryCode: 'KE',
    flag: '🇰🇪',
    pronunciation: 'POH-ah',
    category: 'Adjective'
  },
  {
    id: 'ke-2',
    slang: 'Sawa',
    meaning: 'Okay or alright. Used to agree or acknowledge something.',
    example: '"Meet me at 5pm." "Sawa!"',
    country: 'Kenya',
    countryCode: 'KE',
    flag: '🇰🇪',
    pronunciation: 'SAH-wah',
    category: 'Affirmation'
  },
  {
    id: 'ke-3',
    slang: 'Mambo',
    meaning: 'What\'s up? A casual greeting asking how things are going.',
    example: '"Mambo vipi?" (What\'s happening?)',
    country: 'Kenya',
    countryCode: 'KE',
    flag: '🇰🇪',
    pronunciation: 'MAHM-boh',
    category: 'Greeting'
  },
  {
    id: 'ke-4',
    slang: 'Mbogi',
    meaning: 'A group of friends, squad, or crew. Your close circle.',
    example: '"I\'m rolling with my mbogi tonight."',
    country: 'Kenya',
    countryCode: 'KE',
    flag: '🇰🇪',
    pronunciation: 'mm-BOH-gee',
    category: 'Noun'
  },
  {
    id: 'ke-5',
    slang: 'Fiti',
    meaning: 'Fine, good, or perfect. A Sheng word meaning everything is well.',
    example: '"How\'s the food?" "Fiti!"',
    country: 'Kenya',
    countryCode: 'KE',
    flag: '🇰🇪',
    pronunciation: 'FEE-tee',
    category: 'Adjective'
  },

  // Tanzania 🇹🇿
  {
    id: 'tz-1',
    slang: 'Habari',
    meaning: 'How are you? / What\'s the news? A common Swahili greeting.',
    example: '"Habari yako?" (How are you?)',
    country: 'Tanzania',
    countryCode: 'TZ',
    flag: '🇹🇿',
    pronunciation: 'hah-BAH-ree',
    category: 'Greeting'
  },
  {
    id: 'tz-2',
    slang: 'Bongo',
    meaning: 'Tanzania / Dar es Salaam. Also refers to Tanzanian music and culture.',
    example: '"Bongo Flava is the best music!"',
    country: 'Tanzania',
    countryCode: 'TZ',
    flag: '🇹🇿',
    pronunciation: 'BOHN-goh',
    category: 'Noun'
  },
  {
    id: 'tz-3',
    slang: 'Rafiki',
    meaning: 'Friend. A Swahili word meaning close companion.',
    example: '"You are my rafiki."',
    country: 'Tanzania',
    countryCode: 'TZ',
    flag: '🇹🇿',
    pronunciation: 'rah-FEE-kee',
    category: 'Noun'
  },

  // Ethiopia 🇪🇹
  {
    id: 'et-1',
    slang: 'Konjo',
    meaning: 'Beautiful or handsome. A compliment in Amharic.',
    example: '"You look konjo today!"',
    country: 'Ethiopia',
    countryCode: 'ET',
    flag: '🇪🇹',
    pronunciation: 'KOHN-joh',
    category: 'Adjective'
  },
  {
    id: 'et-2',
    slang: 'Betam',
    meaning: 'Very much or a lot. Used to emphasize something.',
    example: '"I love this betam!"',
    country: 'Ethiopia',
    countryCode: 'ET',
    flag: '🇪🇹',
    pronunciation: 'beh-TAHM',
    category: 'Adverb'
  },

  // Egypt 🇪🇬
  {
    id: 'eg-1',
    slang: 'Yalla',
    meaning: 'Let\'s go / Come on / Hurry up. An expression to encourage action.',
    example: '"Yalla, we\'re going to be late!"',
    country: 'Egypt',
    countryCode: 'EG',
    flag: '🇪🇬',
    pronunciation: 'YAH-lah',
    category: 'Expression'
  },
  {
    id: 'eg-2',
    slang: 'Habibi',
    meaning: 'My love / My dear. A term of endearment for friends and loved ones.',
    example: '"Thanks for helping, habibi!"',
    country: 'Egypt',
    countryCode: 'EG',
    flag: '🇪🇬',
    pronunciation: 'hah-BEE-bee',
    category: 'Noun'
  },
  {
    id: 'eg-3',
    slang: 'Inshallah',
    meaning: 'God willing / If God wills it. Used when talking about future plans.',
    example: '"I\'ll see you tomorrow, inshallah."',
    country: 'Egypt',
    countryCode: 'EG',
    flag: '🇪🇬',
    pronunciation: 'in-SHAH-lah',
    category: 'Expression'
  },

  // Morocco 🇲🇦
  {
    id: 'ma-1',
    slang: 'Labas',
    meaning: 'How are you? / Are you okay? A common Moroccan Arabic greeting.',
    example: '"Labas?" "Labas, hamdullah!"',
    country: 'Morocco',
    countryCode: 'MA',
    flag: '🇲🇦',
    pronunciation: 'lah-BAHS',
    category: 'Greeting'
  },
  {
    id: 'ma-2',
    slang: 'Safi',
    meaning: 'Okay / That\'s it / Done. Used to conclude or agree.',
    example: '"The meeting is at 3pm." "Safi!"',
    country: 'Morocco',
    countryCode: 'MA',
    flag: '🇲🇦',
    pronunciation: 'SAH-fee',
    category: 'Affirmation'
  },

  // Senegal 🇸🇳
  {
    id: 'sn-1',
    slang: 'Nangadef',
    meaning: 'How are you? in Wolof. A standard greeting in Senegal.',
    example: '"Nangadef?" "Mangi fi rekk!"',
    country: 'Senegal',
    countryCode: 'SN',
    flag: '🇸🇳',
    pronunciation: 'nahn-gah-DEF',
    category: 'Greeting'
  },
  {
    id: 'sn-2',
    slang: 'Teranga',
    meaning: 'Hospitality. Senegal is known as the land of Teranga.',
    example: '"Senegalese teranga is famous worldwide."',
    country: 'Senegal',
    countryCode: 'SN',
    flag: '🇸🇳',
    pronunciation: 'teh-RAHN-gah',
    category: 'Noun'
  },

  // Cameroon 🇨🇲
  {
    id: 'cm-1',
    slang: 'Ashia',
    meaning: 'Sorry / Expression of sympathy. Used to comfort someone.',
    example: '"I heard you were sick. Ashia!"',
    country: 'Cameroon',
    countryCode: 'CM',
    flag: '🇨🇲',
    pronunciation: 'ah-SHEE-ah',
    category: 'Expression'
  },
  {
    id: 'cm-2',
    slang: 'Dammer',
    meaning: 'A very attractive person. Cameroonian Pidgin for someone hot.',
    example: '"That girl is a real dammer!"',
    country: 'Cameroon',
    countryCode: 'CM',
    flag: '🇨🇲',
    pronunciation: 'DAH-mah',
    category: 'Noun'
  },

  // Zimbabwe 🇿🇼
  {
    id: 'zw-1',
    slang: 'Mwana',
    meaning: 'Child or young person. Also used affectionately for friends.',
    example: '"Hey mwana, how\'s it going?"',
    country: 'Zimbabwe',
    countryCode: 'ZW',
    flag: '🇿🇼',
    pronunciation: 'MWAH-nah',
    category: 'Noun'
  },
  {
    id: 'zw-2',
    slang: 'Mhuri',
    meaning: 'Family. A Shona word for one\'s family or relatives.',
    example: '"My mhuri is everything to me."',
    country: 'Zimbabwe',
    countryCode: 'ZW',
    flag: '🇿🇼',
    pronunciation: 'mm-HOO-ree',
    category: 'Noun'
  },

  // Uganda 🇺🇬
  {
    id: 'ug-1',
    slang: 'Bambi',
    meaning: 'Oh dear / Poor thing. Expression of sympathy or affection.',
    example: '"Bambi, that child is so cute!"',
    country: 'Uganda',
    countryCode: 'UG',
    flag: '🇺🇬',
    pronunciation: 'BAHM-bee',
    category: 'Expression'
  },
  {
    id: 'ug-2',
    slang: 'Gwe',
    meaning: 'You / Hey you. A casual way to address someone.',
    example: '"Gwe! Come here!"',
    country: 'Uganda',
    countryCode: 'UG',
    flag: '🇺🇬',
    pronunciation: 'GWAY',
    category: 'Pronoun'
  },

  // Rwanda 🇷🇼
  {
    id: 'rw-1',
    slang: 'Murakoze',
    meaning: 'Thank you in Kinyarwanda. A polite expression of gratitude.',
    example: '"Murakoze cyane!" (Thank you very much!)',
    country: 'Rwanda',
    countryCode: 'RW',
    flag: '🇷🇼',
    pronunciation: 'moo-rah-KOH-zay',
    category: 'Expression'
  },

  // Côte d'Ivoire 🇨🇮
  {
    id: 'ci-1',
    slang: 'C\'est doux',
    meaning: 'It\'s sweet / It\'s nice. Used to express approval or satisfaction.',
    example: '"This music, c\'est doux!"',
    country: "Côte d'Ivoire",
    countryCode: 'CI',
    flag: '🇨🇮',
    pronunciation: 'say-DOO',
    category: 'Expression'
  },
  {
    id: 'ci-2',
    slang: 'Gbagbo',
    meaning: 'Money in Nouchi (Ivorian slang). Also spelled as "bagnon".',
    example: '"I need some gbagbo for the weekend."',
    country: "Côte d'Ivoire",
    countryCode: 'CI',
    flag: '🇨🇮',
    pronunciation: 'GBAH-boh',
    category: 'Noun'
  },

  // DRC 🇨🇩
  {
    id: 'cd-1',
    slang: 'Mbote',
    meaning: 'Hello in Lingala. A common greeting in DRC and Congo.',
    example: '"Mbote na yo!" (Hello to you!)',
    country: 'DR Congo',
    countryCode: 'CD',
    flag: '🇨🇩',
    pronunciation: 'mm-BOH-tay',
    category: 'Greeting'
  },
  {
    id: 'cd-2',
    slang: 'Kobeta Libanga',
    meaning: 'To shout out / To give props. Literally "to throw a stone" - a positive mention.',
    example: '"The artist gave a kobeta libanga to his fans."',
    country: 'DR Congo',
    countryCode: 'CD',
    flag: '🇨🇩',
    pronunciation: 'koh-BAY-tah lee-BAHN-gah',
    category: 'Verb'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const random = searchParams.get('random') === 'true';
  const country = searchParams.get('country');
  const daily = searchParams.get('daily') === 'true';

  let filteredSlangs = [...africanSlangs];

  // Filter by country
  if (country && country !== 'all') {
    filteredSlangs = filteredSlangs.filter(s => 
      s.country.toLowerCase().includes(country.toLowerCase()) ||
      s.countryCode.toLowerCase() === country.toLowerCase()
    );
  }

  // Get random slang
  if (random) {
    const randomIndex = Math.floor(Math.random() * filteredSlangs.length);
    return NextResponse.json({
      success: true,
      slang: filteredSlangs[randomIndex]
    });
  }

  // Get daily slang (based on day of year)
  if (daily) {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const dailyIndex = dayOfYear % filteredSlangs.length;
    
    return NextResponse.json({
      success: true,
      slang: filteredSlangs[dailyIndex],
      dayOfYear
    });
  }

  // Return all slangs
  const countries = [...new Set(africanSlangs.map(s => s.country))].sort();
  const categories = [...new Set(africanSlangs.map(s => s.category))].sort();

  return NextResponse.json({
    success: true,
    slangs: filteredSlangs,
    countries,
    categories,
    total: filteredSlangs.length
  });
}
