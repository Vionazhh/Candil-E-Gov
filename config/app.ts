/**
 * App configuration
 */
export const appConfig = {
  // App information
  app: {
    name: 'CANDIL eGov',
    version: '1.0.0',
    description: 'Digital library for government publications',
    author: 'CANDIL Team',
    website: 'https://candil-egov.com',
  },
  
  // App features configuration
  features: {
    // Authentication features
    auth: {
      enabled: true,
      guestMode: true,
      socialLogin: {
        google: true,
        facebook: false,
        apple: false,
      },
      twoFactorAuth: false,
    },
    
    // Book features
    books: {
      // Categories display options
      categories: {
        showFeatured: true,
        featuredCount: 6,
        showAll: true,
      },
      
      // Book listing options
      listing: {
        itemsPerPage: 20,
        showRating: true,
        showAvailability: true,
      },
      
      // Book search options
      search: {
        enabled: true,
        autoComplete: true,
        filters: {
          category: true,
          author: true,
          year: true,
          availability: true,
        },
      },
    },
    
    // Profile features
    profile: {
      editProfile: true,
      history: true,
      favorites: true,
      borrowedBooks: true,
    },
    
    // Appearance features
    appearance: {
      darkMode: true,
      customTheme: false,
      fontSizeAdjustment: true,
    },
  },
  
  // App constants
  constants: {
    // Animation durations
    animation: {
      short: 200,
      medium: 300,
      long: 500,
    },
    
    // App limits
    limits: {
      maxBooksPerUser: 5,
      maxSearchResults: 100,
      maxCategoriesDisplay: 20,
    },
    
    // Time formats
    timeFormats: {
      date: 'DD MMM YYYY',
      time: 'HH:mm',
      dateTime: 'DD MMM YYYY, HH:mm',
    },
  },
};

export default appConfig; 