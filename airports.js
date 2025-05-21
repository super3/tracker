// Shared airport data
const airports = [
    // North America
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', lat: 33.6407, lng: -84.4277 },
    { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', lat: 33.9416, lng: -118.4085 },
    { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', lat: 41.9742, lng: -87.9073 },
    { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', lat: 32.8998, lng: -97.0403 },
    { code: 'DEN', name: 'Denver International Airport', city: 'Denver', lat: 39.8561, lng: -104.6737 },
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', lat: 40.6413, lng: -73.7781 },
    { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', lat: 37.6213, lng: -122.3790 },
    { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', lat: 47.4502, lng: -122.3088 },
    { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', lat: 36.0840, lng: -115.1537 },
    { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', lat: 28.4312, lng: -81.3081 },
    { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', lat: 40.6895, lng: -74.1745 },
    { code: 'MIA', name: 'Miami International Airport', city: 'Miami', lat: 25.7932, lng: -80.2906 },
    { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', lat: 33.4352, lng: -112.0101 },
    { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', lat: 29.9902, lng: -95.3368 },
    { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', lat: 42.3656, lng: -71.0096 },
    { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', lat: 44.8848, lng: -93.2223 },
    { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', lat: 42.2162, lng: -83.3554 },
    { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', lat: 39.8729, lng: -75.2437 },
    { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', lat: 40.7769, lng: -73.8740 },
    { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', lat: 26.0742, lng: -80.1506 },
    { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', lat: 39.1774, lng: -76.6684 },
    { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington DC', lat: 38.8512, lng: -77.0402 },
    { code: 'SLC', name: 'Salt Lake City International Airport', city: 'Salt Lake City', lat: 40.7899, lng: -111.9791 },
    { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington DC', lat: 38.9531, lng: -77.4565 },
    { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', lat: 32.7338, lng: -117.1933 },
    { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', lat: 43.6777, lng: -79.6248 },
    { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', lat: 49.1967, lng: -123.1815 },
    { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', lat: 45.4706, lng: -73.7407 },
    { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', lat: 19.4363, lng: -99.0721 },
    { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', lat: 21.0365, lng: -86.8771 },
    
    // Caribbean
    { code: 'MBJ', name: 'Sangster International Airport', city: 'Montego Bay', lat: 18.5041, lng: -77.9134 },
    { code: 'PUJ', name: 'Punta Cana International Airport', city: 'Punta Cana', lat: 18.5675, lng: -68.3705 },
    { code: 'SJU', name: 'Luis Muñoz Marín International Airport', city: 'San Juan', lat: 18.4373, lng: -66.0018 },
    { code: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', lat: 25.0391, lng: -77.4661 },
    { code: 'AUA', name: 'Queen Beatrix International Airport', city: 'Oranjestad, Aruba', lat: 12.5014, lng: -70.0152 },
    { code: 'GCM', name: 'Owen Roberts International Airport', city: 'Grand Cayman', lat: 19.2921, lng: -81.3577 },
    { code: 'HAV', name: 'José Martí International Airport', city: 'Havana', lat: 22.9891, lng: -82.4091 },
    { code: 'STT', name: 'Cyril E. King Airport', city: 'St. Thomas', lat: 18.3373, lng: -64.9734 },
    { code: 'ANU', name: 'V. C. Bird International Airport', city: 'Antigua', lat: 17.1366, lng: -61.7926 },
    { code: 'BGI', name: 'Grantley Adams International Airport', city: 'Bridgetown, Barbados', lat: 13.0746, lng: -59.4925 },
    { code: 'PTP', name: 'Pointe-à-Pitre International Airport', city: 'Guadeloupe', lat: 16.2654, lng: -61.5324 },
    { code: 'SXM', name: 'Princess Juliana International Airport', city: 'Sint Maarten', lat: 18.0410, lng: -63.1089 },
    { code: 'UVF', name: 'Hewanorra International Airport', city: 'Saint Lucia', lat: 13.7332, lng: -60.9526 },
    { code: 'STI', name: 'Cibao International Airport', city: 'Santiago, Dominican Republic', lat: 19.4066, lng: -70.6042 },
    { code: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston, Jamaica', lat: 17.9355, lng: -76.7870 },
    
    // Europe
    { code: 'LHR', name: 'London Heathrow Airport', city: 'London', lat: 51.4700, lng: -0.4543 },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', lat: 49.0097, lng: 2.5479 },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', lat: 52.3105, lng: 4.7683 },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', lat: 50.0379, lng: 8.5622 },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', lat: 41.2619, lng: 28.7273 },
    { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', lat: 40.4983, lng: -3.5676 },
    { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', lat: 41.8045, lng: 12.2508 },
    { code: 'MUC', name: 'Munich Airport', city: 'Munich', lat: 48.3537, lng: 11.7860 },
    { code: 'LGW', name: 'London Gatwick Airport', city: 'London', lat: 51.1537, lng: -0.1821 },
    { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona', lat: 41.2974, lng: 2.0833 },
    { code: 'SVO', name: 'Sheremetyevo International Airport', city: 'Moscow', lat: 55.9736, lng: 37.4125 },
    { code: 'DME', name: 'Moscow Domodedovo Airport', city: 'Moscow', lat: 55.4088, lng: 37.9069 },
    { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', lat: 53.4264, lng: -6.2499 },
    { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', lat: 47.4647, lng: 8.5492 },
    { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', lat: 55.6180, lng: 12.6508 },
    { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', lat: 59.6498, lng: 17.9237 },
    { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', lat: 48.1102, lng: 16.5697 },
    { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', lat: 53.3537, lng: -2.2750 },
    { code: 'OSL', name: 'Oslo Airport, Gardermoen', city: 'Oslo', lat: 60.1976, lng: 11.1004 },
    { code: 'LIS', name: 'Lisbon Airport', city: 'Lisbon', lat: 38.7742, lng: -9.1342 },
    { code: 'ATH', name: 'Athens International Airport', city: 'Athens', lat: 37.9364, lng: 23.9445 },
    { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', lat: 60.3183, lng: 24.9630 },
    { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', lat: 52.1672, lng: 20.9679 },
    { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', lat: 50.9014, lng: 4.4844 },
    
    // Asia & Middle East
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', lat: 25.2528, lng: 55.3644 },
    { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', lat: 35.5494, lng: 139.7798 },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', lat: 1.3644, lng: 103.9915 },
    { code: 'ICN', name: 'Seoul Incheon International Airport', city: 'Seoul', lat: 37.4602, lng: 126.4407 },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', lat: 22.3080, lng: 113.9185 },
    { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', lat: 31.1443, lng: 121.8083 },
    { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', lat: 40.0799, lng: 116.6031 },
    { code: 'PKX', name: 'Beijing Daxing International Airport', city: 'Beijing', lat: 39.5098, lng: 116.4105 },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', lat: 2.7456, lng: 101.7099 },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', lat: 13.6900, lng: 100.7501 },
    { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', lat: 25.0797, lng: 121.2342 },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', lat: 35.7719, lng: 140.3929 },
    { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', lat: -6.1275, lng: 106.6537 },
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', lat: 28.5562, lng: 77.1000 },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', lat: 25.2609, lng: 51.6138 },
    { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', lat: 24.4331, lng: 54.6511 },
    { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', lat: 23.3959, lng: 113.3080 },
    { code: 'SZX', name: 'Shenzhen Bao\'an International Airport', city: 'Shenzhen', lat: 22.6395, lng: 113.8107 },
    { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', lat: 34.4320, lng: 135.2304 },
    { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', lat: 14.5086, lng: 121.0197 },
    { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', lat: 21.2180, lng: 105.8050 },
    { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', lat: 10.8188, lng: 106.6520 },
    
    // Australia & Oceania
    { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', lat: -33.9399, lng: 151.1753 },
    { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', lat: -37.6690, lng: 144.8410 },
    { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', lat: -27.3942, lng: 153.1218 },
    { code: 'PER', name: 'Perth Airport', city: 'Perth', lat: -31.9385, lng: 115.9672 },
    { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', lat: -37.0082, lng: 174.7850 },
    { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', lat: -43.4864, lng: 172.5369 },
    { code: 'WLG', name: 'Wellington International Airport', city: 'Wellington', lat: -41.3276, lng: 174.8076 },
    
    // Africa
    { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', lat: -26.1367, lng: 28.2411 },
    { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', lat: -33.9689, lng: 18.5986 },
    { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', lat: 30.1219, lng: 31.4056 },
    { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', lat: 8.9778, lng: 38.7993 },
    { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', lat: -1.3192, lng: 36.9279 },
    { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', lat: 6.5774, lng: 3.3214 },
    { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', lat: 33.3676, lng: -7.5900 },
    
    // South America
    { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', lat: -23.4356, lng: -46.4731 },
    { code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', lat: -34.8222, lng: -58.5358 },
    { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', lat: 4.7016, lng: -74.1469 },
    { code: 'SCL', name: 'Santiago International Airport', city: 'Santiago', lat: -33.3930, lng: -70.7956 },
    { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', lat: -12.0219, lng: -77.1143 },
    { code: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', lat: -22.8099, lng: -43.2506 }
];

// Helper function to calculate distance between two points using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// Find nearest airport based on user's coordinates
function findNearestAirport(userLat, userLng) {
    let nearestAirport = null;
    let shortestDistance = Infinity;
    
    airports.forEach(airport => {
        const distance = getDistance(userLat, userLng, airport.lat, airport.lng);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestAirport = airport;
        }
    });
    
    return nearestAirport;
}

// Make Alpine components available globally
window.searchForm = function() {
    return {
        toFieldError: false,
        
        validateSearch() {
            // Find the To input field
            const toField = document.querySelector('.grid-input:nth-of-type(3)');
            const toInput = toField.querySelector('input');
            
            // Check if there's a destination selected
            if (!toInput || !toInput.value.trim()) {
                // Flash the border red once
                this.toFieldError = true;
                
                // Reset the error state after the animation completes
                setTimeout(() => {
                    this.toFieldError = false;
                }, 1000);
                
                return false;
            }
            
            // If validation passes, proceed with search
            console.log('Search validated, proceeding with form submission');
            return true;
        }
    };
};

window.airportFrom = function() {
    return {
        airports: airports,
        search: '',
        showDropdown: false,
        selectedAirport: null,
        init() {
            // Attempt to get user's location via IP
            fetch('https://ipapi.co/json/')
                .then(response => response.json())
                .then(data => {
                    if (data.latitude && data.longitude) {
                        const nearestAirport = findNearestAirport(data.latitude, data.longitude);
                        if (nearestAirport) {
                            this.selectedAirport = nearestAirport;
                            this.search = nearestAirport.city + ' (' + nearestAirport.code + ')';
                            console.log('Auto-filled nearest airport:', nearestAirport.city);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error getting user location:', error);
                });
        },
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