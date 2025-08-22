const axios = require('axios');
const config = require('../config/config');
const postcodeService = require('./postcodeService');

console.log('Setting up Travel Time Service...');

class TravelTimeService {
  constructor() {
    this.openRouteApiKey = config.apis.openroute.apiKey;
    this.openRouteBaseUrl = config.apis.openroute.baseUrl;
    this.officePostcode = config.business.officePostcode;
    this.defaultSpeedKmh = config.business.defaultTravelSpeedKmh;
    
    console.log('Office postcode:', this.officePostcode);
    console.log('Default speed:', this.defaultSpeedKmh, 'km/h');
  }

  async calculateTravelInfo(propertyPostcode) {
    try {
      console.log('Calculating travel info to:', propertyPostcode);
      
      // Get coordinates for both locations
      const [officeCoords, propertyCoords] = await Promise.all([
        postcodeService.getCoordinates(this.officePostcode),
        postcodeService.getCoordinates(propertyPostcode)
      ]);
      
      console.log('Office coordinates:', officeCoords.latitude, officeCoords.longitude);
      console.log('Property coordinates:', propertyCoords.latitude, propertyCoords.longitude);
      
      // Try to get routing information from OpenRouteService
      let routingInfo = null;
      
      if (this.openRouteApiKey) {
        try {
          routingInfo = await this.getRoutingInfo(officeCoords, propertyCoords);
        } catch (error) {
          console.log('Routing API failed, using fallback calculation:', error.message);
        }
      } else {
        console.log('No/Invalid OpenRoute API key');
      }
      
      // Use routing info if available, otherwise calculate using distance and default speed
      let distanceKm, travelTimeMinutes;
      
      if (routingInfo) {
        distanceKm = routingInfo.distance;
        travelTimeMinutes = routingInfo.duration;
      } else {
        // Fallback: calculate straight-line distance and estimate time
        distanceKm = postcodeService.haversineDistance(
          officeCoords.latitude, officeCoords.longitude,
          propertyCoords.latitude, propertyCoords.longitude
        );
        
        // Add 30% to straight-line distance for roads
        distanceKm = distanceKm * 1.3;
        
        // Calculate time based on default speed
        travelTimeMinutes = Math.round((distanceKm / this.defaultSpeedKmh) * 60);
        
        console.log('Using fallback calculation');
      }
      
      console.log(`Distance: ${distanceKm.toFixed(2)} km`);
      console.log(`Travel time: ${travelTimeMinutes} minutes`);
      
      return {
        distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
        travelTimeMinutes: Math.max(travelTimeMinutes, 5), // Minimum 5 minutes
        officeCoordinates: officeCoords,
        propertyCoordinates: propertyCoords,
        routingMethod: routingInfo ? 'api' : 'fallback'
      };
      
    } catch (error) {
      console.error('Travel calculation failed:', error.message);
      throw new Error(`Unable to calculate travel time: ${error.message}`);
    }
  }

  async getRoutingInfo(start, end) {
    if (!this.openRouteApiKey) {
      throw new Error('OpenRoute API key not configured');
    }
    
    try {
      console.log('Getting routing info from OpenRouteService...');
      
      const response = await axios.post(
        `${this.openRouteBaseUrl}/v2/directions/driving-car/geojson`,
        {
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude]
          ],
          radiuses: [1000, 1000], // Allow 1km radius for coordinate snapping
          instructions: false // We don't need turn-by-turn directions
        },
        {
          headers: {
            'Authorization': this.openRouteApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (response.data.features && response.data.features.length > 0) {
        const route = response.data.features[0];
        const summary = route.properties.summary;
        
        return {
          distance: summary.distance / 1000, // Convert meters to kilometers
          duration: Math.round(summary.duration / 60) // Convert seconds to minutes
        };
      } else {
        throw new Error('No route found');
      }
      
    } catch (error) {
      console.error('OpenRoute API error:', error.message);
      
      if (error.response) {
        console.error('API response status:', error.response.status);
        console.error('API response data:', error.response.data);
      }
      
      throw error;
    }
  }

 
  calculateScheduleTimes(appointmentTime, travelTimeMinutes) {
    console.log('Calculating schedule times...');
    
    // Parse appointment time
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date();
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    // Calculate departure time (leave office)
    const departureDateTime = new Date(appointmentDateTime);
    departureDateTime.setMinutes(departureDateTime.getMinutes() - travelTimeMinutes);
    
    // Calculate return time (appointment + 1 hour duration + travel back)
    const returnDateTime = new Date(appointmentDateTime);
    returnDateTime.setMinutes(returnDateTime.getMinutes() + 60 + travelTimeMinutes);
    
    // Available again time is same as return time
    const availableAgainDateTime = new Date(returnDateTime);
    
    // Format times as HH:MM:SS
    const formatTime = (date) => {
      return date.toTimeString().split(' ')[0]; // Gets "HH:MM:SS" part
    };
    
    const result = {
      departureTime: formatTime(departureDateTime),
      returnTime: formatTime(returnDateTime),
      availableAgainTime: formatTime(availableAgainDateTime)
    };
    
    console.log(' Schedule calculated:');
    console.log('   Departure:', result.departureTime);
    console.log('   Return:', result.returnTime);
    console.log('   Available again:', result.availableAgainTime);
    
    return result;
  }
}

// Create and export a single instance
const travelTimeService = new TravelTimeService();

console.log('Travel time service ready!');

module.exports = travelTimeService;