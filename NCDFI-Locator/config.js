'use strict';

// eslint-disable-next-line no-unused-vars
const config = {
  style: 'mapbox://styles/mapbox/light-v10',
  accessToken:
    'pk.eyJ1IjoiaXNhaWFoY29ybmVsaXVzIiwiYSI6ImNsbzJldHVwdzFmMWEya3FoNGo5ZXoybG8ifQ.P4y494VuvnDyeTQDNtEoDA',
  CSV: './Sample_Data.csv',
  center: [-118, 51],
  zoom: 3,
  title: 'Native CDFI Locator',
  description: 'Certified Native CDFI of the United States of America.',
  sideBarInfo: ['Location_Name', 'Address', 'Phone'],
  popupInfo: ['Location_Name'],
  filters: [
    {
      type: 'dropdown',
      title: 'Languages supported: ',
      columnHeader: 'Languages',
      listItems: [
        'Amharic',
        'ASL',
        'Cambodian',
        'Chinese',
        'Danish',
        'English',
        'French',
        'German',
        'Greek',
        'Hindi',
        'Italian',
        'Japanese',
        'Korean',
        'Language Line Services',
        'Norwegian',
        'Oriya',
        'Portuguese',
        'Punjabi',
        'Russian',
        'Somali',
        'Spanish',
        'Swedish',
        'Tagalog',
        'Thai',
        'Tigrinya',
        'Tongan',
        'Vietnamese',
        'Ukranian',
      ],
    },
    {
      type: 'checkbox',
      title: 'Devices available: ',
      columnHeader: 'Devices_available', // Case sensitive - must match spreadsheet entry
      listItems: ['Computer', 'Wi-Fi', 'Adaptive Laptops'], // Case sensitive - must match spreadsheet entry; This will take up to six inputs but is best used with a maximum of three;
    },
    {
      type: 'dropdown',
      title: 'Clients: ',
      columnHeader: 'Clients',
      listItems: [
        'Adults',
        'Disabled',
        'Homeless',
        'Immigrants/Refugees',
        'Low Income',
        'Seniors',
        'Youth: Pre-teen',
        'Youth: Teen',
      ],
    },
  ],
};
