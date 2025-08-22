const axios = require('axios');
const config = require('../config/config');


class PostcodeService {
  constructor() {
    this.baseUrl = config.apis.postcodes.baseUrl;
    console.log('Postcode service initialized:', this.baseUrl);
  }

  /**
   * Get coordinates for a UK postcode
   * @param {string} postcode - UK postcode (e.g., "SW1A 1AA")
   * @returns {Promise<Object>} Coordinates and location data
   */
  async getCoordinates(postcode) {
    try {
      console.log('Looking up postcode:', postcode);
      
      // Clean postcode (remove spaces, uppercase)
      const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
      
      // Make API request
      const response = await axios.get(`${this.baseUrl}/postcodes/${cleanPostcode}`, {
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data.status !== 200) {
        throw new Error(`Invalid postcode: ${postcode}`);
      }

      const result = response.data.result;
      
      console.log('Postcode found:', result.postcode);
      
      return {
        postcode: result.postcode,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country,
        region: result.region,
        adminDistrict: result.admin_district,
        eastings: result.eastings,
        northings: result.northings
      };
      
    } catch (error) {
      console.error('❌ Postcode lookup failed:', error.message);
      
      if (error.response && error.response.status === 404) {
        throw new Error(`Postcode not found: ${postcode}`);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Postcode service timeout - please try again');
      }
      
      throw new Error(`Failed to lookup postcode: ${postcode}`);
    }
  }

  /**
   * Validate if a postcode exists and is valid
   * @param {string} postcode - UK postcode to validate
   * @returns {Promise<boolean>} True if valid, false if not
   */
  async validatePostcode(postcode) {
    try {
      await this.getCoordinates(postcode);
      return true;
    } catch (error) {
      console.log('📍 Postcode validation failed:', error.message);
      return false;
    }
  }

  /**
   * Calculate distance between two postcodes
   * @param {string} postcode1 - First postcode
   * @param {string} postcode2 - Second postcode
   * @returns {Promise<number>} Distance in kilometers
   */
  async calculateDistance(postcode1, postcode2) {
    try {
      console.log('📏 Calculating distance between postcodes');
      
      // Get coordinates for both postcodes
      const [coords1, coords2] = await Promise.all([
        this.getCoordinates(postcode1),
        this.getCoordinates(postcode2)
      ]);
      
      // Calculate distance using Haversine formula
      const distance = this.haversineDistance(
        coords1.latitude, coords1.longitude,
        coords2.latitude, coords2.longitude
      );
      
      console.log(`📏 Distance: ${distance.toFixed(2)} km`);
      return distance;
      
    } catch (error) {
      console.error('❌ Distance calculation failed:', error.message);
      throw error;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    
    // Convert degrees to radians
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in kilometers
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees 
   * @returns {number} Radians
   */
  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

// Create and export a single instance
const postcodeService = new PostcodeService();

console.log('✅ Postcode service ready!');

module.exports = postcodeService;