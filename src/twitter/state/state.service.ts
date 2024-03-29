import { Injectable } from '@nestjs/common';

@Injectable()
export class StateService {
  private readonly states = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'NewHampshire',
    NJ: 'NewJersey',
    NM: 'NewMexico',
    NY: 'NewYork',
    NC: 'NorthCarolina',
    ND: 'NorthDakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'RhodeIsland',
    SC: 'SouthCarolina',
    SD: 'SouthDakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'WestVirginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
  };

  public getStateFromCode(office: string) {
    const stateCode = office.slice(0, 2);
    return this.states[stateCode];
  }
}
