// Shared airport data
const airports = [
    // North America
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta' },
    { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' },
    { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago' },
    { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
    { code: 'DEN', name: 'Denver International Airport', city: 'Denver' },
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York' },
    { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco' },
    { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle' },
    { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas' },
    { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando' },
    { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark' },
    { code: 'MIA', name: 'Miami International Airport', city: 'Miami' },
    { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix' },
    { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston' },
    { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston' },
    { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis' },
    { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit' },
    { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia' },
    { code: 'LGA', name: 'LaGuardia Airport', city: 'New York' },
    { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale' },
    { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore' },
    { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington DC' },
    { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City' },
    { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington DC' },
    { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego' },
    { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto' },
    { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver' },
    { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal' },
    { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City' },
    { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún' },
    
    // Caribbean
    { code: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay' },
    { code: 'PUJ', name: 'Punta Cana International Airport', city: 'Punta Cana' },
    { code: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan' },
    { code: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau' },
    { code: 'AUA', name: 'Queen Beatrix International Airport', city: 'Oranjestad, Aruba' },
    { code: 'GCM', name: 'Owen Roberts International Airport', city: 'Grand Cayman' },
    { code: 'HAV', name: 'José Martí International Airport', city: 'Havana' },
    { code: 'STT', name: 'Cyril E. King Airport', city: 'St. Thomas' },
    { code: 'ANU', name: 'V. C. Bird International Airport', city: 'Antigua' },
    { code: 'BGI', name: 'Grantley Adams International Airport', city: 'Bridgetown, Barbados' },
    { code: 'PTP', name: 'Pointe-à-Pitre International Airport', city: 'Guadeloupe' },
    { code: 'SXM', name: 'Princess Juliana International Airport', city: 'Sint Maarten' },
    { code: 'UVF', name: 'Hewanorra International Airport', city: 'Saint Lucia' },
    { code: 'STI', name: 'Cibao International Airport', city: 'Santiago, Dominican Republic' },
    { code: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston, Jamaica' },
    
    // Europe
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid' },
    { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome' },
    { code: 'MUC', name: 'Munich Airport', city: 'Munich' },
    { code: 'LGW', name: 'London Gatwick Airport', city: 'London' },
    { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona' },
    { code: 'SVO', name: 'Sheremetyevo International Airport', city: 'Moscow' },
    { code: 'DME', name: 'Moscow Domodedovo Airport', city: 'Moscow' },
    { code: 'DUB', name: 'Dublin Airport', city: 'Dublin' },
    { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich' },
    { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen' },
    { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm' },
    { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna' },
    { code: 'MAN', name: 'Manchester Airport', city: 'Manchester' },
    { code: 'OSL', name: 'Oslo Airport, Gardermoen', city: 'Oslo' },
    { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon' },
    { code: 'ATH', name: 'Athens International Airport', city: 'Athens' },
    { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki' },
    { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw' },
    { code: 'BRU', name: 'Brussels Airport', city: 'Brussels' },
    
    // Asia & Middle East
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
    { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo' },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' },
    { code: 'ICN', name: 'Seoul Incheon International Airport', city: 'Seoul' },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong' },
    { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai' },
    { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing' },
    { code: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing' },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok' },
    { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei' },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo' },
    { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta' },
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha' },
    { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi' },
    { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou' },
    { code: 'SZX', name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen' },
    { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka' },
    { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila' },
    { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi' },
    { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City' },
    
    // Australia & Oceania
    { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney' },
    { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne' },
    { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane' },
    { code: 'PER', name: 'Perth Airport', city: 'Perth' },
    { code: 'AKL', name: 'Auckland Airport', city: 'Auckland' },
    { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch' },
    { code: 'WLG', name: 'Wellington International Airport', city: 'Wellington' },
    
    // Africa
    { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg' },
    { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town' },
    { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo' },
    { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa' },
    { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi' },
    { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos' },
    { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca' },
    
    // South America
    { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo' },
    { code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires' },
    { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá' },
    { code: 'SCL', name: 'Santiago International Airport', city: 'Santiago' },
    { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima' },
    { code: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro' }
];

// Make Alpine components available globally
window.airportFrom = function() {
    return {
        airports: airports,
        search: '',
        showDropdown: false,
        selectedAirport: null,
        filteredAirports() {
            if (!this.search || this.search.length < 2) return [];
            
            const searchLower = this.search.toLowerCase();
            return this.airports.filter(airport => 
                airport.code.toLowerCase().includes(searchLower) || 
                airport.name.toLowerCase().includes(searchLower) || 
                airport.city.toLowerCase().includes(searchLower)
            ).slice(0, 5);
        },
        selectAirport(airport) {
            this.selectedAirport = airport;
            this.search = airport.city + ' (' + airport.code + ')';
            this.showDropdown = false;
        }
    };
};

window.airportTo = function() {
    return {
        airports: airports,
        search: '',
        showDropdown: false,
        selectedAirport: null,
        filteredAirports() {
            if (!this.search || this.search.length < 2) return [];
            
            const searchLower = this.search.toLowerCase();
            return this.airports.filter(airport => 
                airport.code.toLowerCase().includes(searchLower) || 
                airport.name.toLowerCase().includes(searchLower) || 
                airport.city.toLowerCase().includes(searchLower)
            ).slice(0, 5);
        },
        selectAirport(airport) {
            this.selectedAirport = airport;
            this.search = airport.city + ' (' + airport.code + ')';
            this.showDropdown = false;
        }
    };
}; 