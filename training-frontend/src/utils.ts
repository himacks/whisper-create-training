

export interface AudioSet {
    id: string;
    displayName: string;
  }

export const AudioSets: { [key: string]: AudioSet } = {
  Audience_Cheer: { id: '/m/02k7j', displayName: 'Audience Cheer'},
  Audience_Laugh: { id: '/m/01d2x', displayName: 'Audience Laugh'},
  Audience_Applause: {
    id: '/m/09r45',
    displayName: 'Audience Applause'
  }
}

export const API_URL = 'http://127.0.0.1:5000';
