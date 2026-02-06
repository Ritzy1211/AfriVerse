import { NextRequest, NextResponse } from 'next/server';

// African Historical Events Database
// In production, this would come from a database
const historicalEvents: Record<string, { year: number; event: string; category: string; country?: string }[]> = {
  // January
  '01-01': [
    { year: 1804, event: 'Haiti declares independence, becoming the first Black republic', category: 'Independence', country: 'Haiti' },
    { year: 1956, event: 'Sudan gains independence from Britain and Egypt', category: 'Independence', country: 'Sudan' },
    { year: 1960, event: 'Cameroon gains independence from France', category: 'Independence', country: 'Cameroon' },
  ],
  '01-04': [
    { year: 1961, event: 'First Nigerian television station (WNTV) begins broadcasting', category: 'Media', country: 'Nigeria' },
  ],
  '01-12': [
    { year: 1964, event: 'Zanzibar Revolution overthrows the Sultan', category: 'Politics', country: 'Tanzania' },
  ],
  // February
  '02-01': [
    { year: 2003, event: 'African Union is officially launched, replacing the OAU', category: 'Politics' },
  ],
  '02-04': [
    { year: 1974, event: 'Grenada gains independence from Britain', category: 'Independence', country: 'Grenada' },
  ],
  '02-06': [
    { year: 1952, event: 'Queen Elizabeth II ascends to the throne while in Kenya', category: 'History', country: 'Kenya' },
    { year: 1966, event: 'First African astronaut candidate, Kwame Nkrumah, proposes Ghana space program', category: 'Science', country: 'Ghana' },
  ],
  '02-11': [
    { year: 1990, event: 'Nelson Mandela is released from prison after 27 years', category: 'Politics', country: 'South Africa' },
  ],
  '02-18': [
    { year: 1965, event: 'The Gambia gains independence from Britain', category: 'Independence', country: 'Gambia' },
  ],
  '02-21': [
    { year: 1966, event: 'Kwame Nkrumah is overthrown in Ghana', category: 'Politics', country: 'Ghana' },
  ],
  '02-24': [
    { year: 2022, event: 'Russia invades Ukraine, affecting African food security', category: 'Global', },
  ],
  // March
  '03-06': [
    { year: 1957, event: 'Ghana becomes the first sub-Saharan African country to gain independence', category: 'Independence', country: 'Ghana' },
  ],
  '03-12': [
    { year: 1968, event: 'Mauritius gains independence from Britain', category: 'Independence', country: 'Mauritius' },
  ],
  '03-21': [
    { year: 1960, event: 'Sharpeville massacre in South Africa - 69 killed by police', category: 'Human Rights', country: 'South Africa' },
    { year: 1990, event: 'Namibia gains independence from South Africa', category: 'Independence', country: 'Namibia' },
  ],
  '03-26': [
    { year: 1991, event: 'Treaty of Asunción creates Mercosur', category: 'Economics' },
  ],
  // April
  '04-06': [
    { year: 1994, event: 'Rwandan genocide begins - approximately 800,000 killed', category: 'Tragedy', country: 'Rwanda' },
  ],
  '04-18': [
    { year: 1980, event: 'Zimbabwe gains independence from Britain', category: 'Independence', country: 'Zimbabwe' },
  ],
  '04-26': [
    { year: 1994, event: 'South Africa holds first democratic elections - Mandela votes', category: 'Politics', country: 'South Africa' },
  ],
  '04-27': [
    { year: 1961, event: 'Sierra Leone gains independence from Britain', category: 'Independence', country: 'Sierra Leone' },
    { year: 1994, event: 'Nelson Mandela elected as South Africa first Black president', category: 'Politics', country: 'South Africa' },
  ],
  // May
  '05-10': [
    { year: 1994, event: 'Nelson Mandela inaugurated as President of South Africa', category: 'Politics', country: 'South Africa' },
  ],
  '05-25': [
    { year: 1963, event: 'Organisation of African Unity (OAU) founded - now Africa Day', category: 'Politics' },
    { year: 1981, event: 'Africa Day established as a continental holiday', category: 'Culture' },
  ],
  '05-31': [
    { year: 1961, event: 'South Africa becomes a republic and leaves the Commonwealth', category: 'Politics', country: 'South Africa' },
  ],
  // June
  '06-12': [
    { year: 1993, event: 'MKO Abiola wins Nigerian presidential election (later annulled)', category: 'Politics', country: 'Nigeria' },
  ],
  '06-16': [
    { year: 1976, event: 'Soweto Uprising begins - students protest apartheid education', category: 'Human Rights', country: 'South Africa' },
  ],
  '06-26': [
    { year: 1960, event: 'Madagascar gains independence from France', category: 'Independence', country: 'Madagascar' },
    { year: 1963, event: 'Organization of African Unity adopts the OAU Charter', category: 'Politics' },
  ],
  '06-30': [
    { year: 1960, event: 'Democratic Republic of Congo gains independence from Belgium', category: 'Independence', country: 'DR Congo' },
  ],
  // July
  '07-01': [
    { year: 1960, event: 'Somalia gains independence (merger of British and Italian colonies)', category: 'Independence', country: 'Somalia' },
    { year: 1962, event: 'Rwanda and Burundi gain independence from Belgium', category: 'Independence', country: 'Rwanda/Burundi' },
  ],
  '07-05': [
    { year: 1962, event: 'Algeria gains independence from France after 8-year war', category: 'Independence', country: 'Algeria' },
  ],
  '07-06': [
    { year: 1964, event: 'Malawi gains independence from Britain', category: 'Independence', country: 'Malawi' },
  ],
  '07-18': [
    { year: 1918, event: 'Nelson Mandela is born in Mvezo, South Africa', category: 'Birthday', country: 'South Africa' },
  ],
  '07-26': [
    { year: 1956, event: 'Egypt nationalizes the Suez Canal', category: 'Politics', country: 'Egypt' },
  ],
  // August
  '08-01': [
    { year: 1960, event: 'Benin (Dahomey) gains independence from France', category: 'Independence', country: 'Benin' },
  ],
  '08-03': [
    { year: 1960, event: 'Niger gains independence from France', category: 'Independence', country: 'Niger' },
  ],
  '08-05': [
    { year: 1960, event: 'Burkina Faso (Upper Volta) gains independence from France', category: 'Independence', country: 'Burkina Faso' },
  ],
  '08-07': [
    { year: 1960, event: 'Ivory Coast gains independence from France', category: 'Independence', country: 'Ivory Coast' },
    { year: 1998, event: 'US Embassy bombings in Kenya and Tanzania kill 224', category: 'Tragedy', country: 'Kenya/Tanzania' },
  ],
  '08-11': [
    { year: 1960, event: 'Chad gains independence from France', category: 'Independence', country: 'Chad' },
  ],
  '08-13': [
    { year: 1960, event: 'Central African Republic gains independence from France', category: 'Independence', country: 'Central African Republic' },
  ],
  '08-15': [
    { year: 1960, event: 'Congo (Brazzaville) gains independence from France', category: 'Independence', country: 'Republic of Congo' },
  ],
  '08-17': [
    { year: 1960, event: 'Gabon gains independence from France', category: 'Independence', country: 'Gabon' },
    { year: 1896, event: 'Gold discovered in South Africa, starting the Gold Rush', category: 'Economics', country: 'South Africa' },
  ],
  // September
  '09-12': [
    { year: 1974, event: 'Ethiopian Emperor Haile Selassie overthrown', category: 'Politics', country: 'Ethiopia' },
  ],
  '09-22': [
    { year: 1960, event: 'Mali gains independence from France', category: 'Independence', country: 'Mali' },
  ],
  // October
  '10-01': [
    { year: 1960, event: 'Nigeria gains independence from Britain', category: 'Independence', country: 'Nigeria' },
  ],
  '10-04': [
    { year: 1966, event: 'Lesotho gains independence from Britain', category: 'Independence', country: 'Lesotho' },
  ],
  '10-09': [
    { year: 1962, event: 'Uganda gains independence from Britain', category: 'Independence', country: 'Uganda' },
  ],
  '10-24': [
    { year: 1964, event: 'Zambia gains independence from Britain', category: 'Independence', country: 'Zambia' },
  ],
  // November
  '11-01': [
    { year: 1954, event: 'Algerian War of Independence begins against France', category: 'Independence', country: 'Algeria' },
  ],
  '11-11': [
    { year: 1975, event: 'Angola gains independence from Portugal', category: 'Independence', country: 'Angola' },
  ],
  '11-18': [
    { year: 1976, event: 'Seychelles gains independence from Britain', category: 'Independence', country: 'Seychelles' },
  ],
  '11-28': [
    { year: 1960, event: 'Mauritania gains independence from France', category: 'Independence', country: 'Mauritania' },
  ],
  // December
  '12-09': [
    { year: 1961, event: 'Tanzania (Tanganyika) gains independence from Britain', category: 'Independence', country: 'Tanzania' },
  ],
  '12-12': [
    { year: 1963, event: 'Kenya gains independence from Britain', category: 'Independence', country: 'Kenya' },
  ],
  '12-24': [
    { year: 1951, event: 'Libya gains independence from Italy/UN trusteeship', category: 'Independence', country: 'Libya' },
  ],
};

// Notable African birthdays
const notableBirthdays: Record<string, { name: string; born: number; description: string; country: string }[]> = {
  '01-17': [
    { name: 'Muhammad Ali', born: 1942, description: 'Legendary boxer with African heritage', country: 'USA' },
  ],
  '02-06': [
    { name: 'Bob Marley', born: 1945, description: 'Reggae legend who championed African unity', country: 'Jamaica' },
  ],
  '05-19': [
    { name: 'Malcolm X', born: 1925, description: 'Civil rights leader and Pan-Africanist', country: 'USA' },
  ],
  '07-18': [
    { name: 'Nelson Mandela', born: 1918, description: 'Anti-apartheid revolutionary and President of South Africa', country: 'South Africa' },
  ],
  '08-17': [
    { name: 'Marcus Garvey', born: 1887, description: 'Pan-Africanist leader and founder of UNIA', country: 'Jamaica' },
  ],
  '10-21': [
    { name: 'Fela Kuti', born: 1938, description: 'Afrobeat pioneer and activist', country: 'Nigeria' },
  ],
  '11-30': [
    { name: 'Wangari Maathai', born: 1940, description: 'Nobel Peace Prize laureate and environmentalist', country: 'Kenya' },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  // Use provided date or today
  const date = dateParam ? new Date(dateParam) : new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;
  
  const events = historicalEvents[dateKey] || [];
  const birthdays = notableBirthdays[dateKey] || [];
  
  // Calculate "years ago" for each event
  const currentYear = date.getFullYear();
  const eventsWithAge = events.map(event => ({
    ...event,
    yearsAgo: currentYear - event.year,
  }));
  
  const birthdaysWithAge = birthdays.map(person => ({
    ...person,
    age: currentYear - person.born,
  }));

  return NextResponse.json({
    success: true,
    date: date.toISOString().split('T')[0],
    displayDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    events: eventsWithAge,
    birthdays: birthdaysWithAge,
    totalEvents: eventsWithAge.length + birthdaysWithAge.length,
  });
}
