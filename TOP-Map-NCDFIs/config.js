'use strict';

// eslint-disable-next-line no-unused-vars
const config = {
  style: 'mapbox://styles/mapbox/light-v10',
  accessToken:
    'pk.eyJ1IjoiaXNhaWFoY29ybmVsaXVzIiwiYSI6ImNsbzJldHVwdzFmMWEya3FoNGo5ZXoybG8ifQ.P4y494VuvnDyeTQDNtEoDA',
  CSV: './NCDFIs.csv',
  center: [-114, 51],
  zoom: 2,
  title: 'Native CDFI Locator',
  description:
    '2023 Native Community Development Financial Institutions seeking investments',
  sideBarInfo: ['Org_Name', 'Address', 'City_ST_Zip'],
  popupLocation_Name: ['Org_Name'],
  popupWebsite: ['Website'],
  popupContactInfo: ['Contact_Info'],
  popupEmergingNCDFI: ['Emerging_NCDFI'],
  popupCurrentlyCertified: ['Currently_Certified'],
  popupServiceArea: ['Service_Area_Footprint'],
  popupTargetMarket: ['Target_Market'],
  popupMissionStatement: ['Mission_Statement'],
  popupParticipationLending: ['Participation_Lending'],
  popupLendingProducts: ['Lending_Products'],
  popupCurrentAssetSize: ['Current_Asset_Size'],
  popupFundingNeeds: ['Funding_Needs'],
  popupMin: ['Min'],
  popupMax: ['Max'],
  popupInvestmentTerms: ['Investment_Terms_Obj'],
  popupNeedsOperationalCapital: ['Needs_Operational_Capital'],
  popupSpecialCerts: ['Special_Certifications'],
  popupSpecialProjects: ['Special_Projects'],
  filters: [
    {
      type: 'dropdown',
      title: 'State: ',
      columnHeader: 'State',
      listItems: [
        'AK',
        'AZ',
        'CO',
        'HI',
        'ID',
        'MI',
        'MT',
        'OK',
        'SD',
        'WA',
        'WI',
        'WY',
      ],
    },
    {
      type: 'checkbox',
      title: 'Financial Institution Type: ',
      columnHeader: 'CDFI_Type', // Case sensitive - must match spreadsheet entry
      listItems: ['Bank', 'Loan Fund'], // Case sensitive - must match spreadsheet entry; This will take up to six inputs but is best used with a maximum of three;
    },
  ],
};
