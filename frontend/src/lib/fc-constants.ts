import {
  calculateDataStorageService,
  calculateInteractiveEndUserInputService,
  calculateNonInteractiveEndUserOutputService,
  calculateInterfaceServiceToOtherApplications,
  calculateInterfaceServiceFromOtherApplications,
  calculateInteractiveEndUserNavigationAndQueryService,
  calculateAlgorithmicOrManipulationService
} from "./calculations.ts";

export const classNameOptions = [
  {
    value: "Interactive end-user navigation and query service",
    displayName: "Vuorovaikutteinen navigointi- tai kyselytoiminto"
  },
  {
    value: "Interactive end-user input service",
    displayName: "Vuorovaikutteinen syöttötoiminto"
  },
  {
    value: "Non-interactive end-user output service",
    displayName: "Yksisuuntainen tulostetoiminto"
  },
  {
    value: "Interface service to other applications",
    displayName: "Lähetettävä liittymätoiminto"
  },
  {
    value: "Interface service from other applications",
    displayName: "Vastaanotettava liittymätoiminto"
  },
  {
    value: "Data storage service",
    displayName: "Tiedonvarastointitoiminto"
  },
  {
    value: "Algorithmic or manipulation service",
    displayName: "Algoritminen toiminto tai käsittelytoiminto"
  }
];

export const componentTypeOptions = [
  {
    className: "Interactive end-user navigation and query service",
    componentTypeOptions: [
      {
        value: "function designators",
        displayName: "toiminto-osoittimet"
      },
      {
        value: "log-in, log-out functions",
        displayName: "kirjautumistoiminnot"
      },
      {
        value: "function lists",
        displayName: "toimintovalikot"
      },
      {
        value: "selection lists",
        displayName: "valintalistat"
      },
      {
        value: "data inquiries",
        displayName: "kyselynäytöt"
      },
      {
        value: "generation indicators",
        displayName: "toimintojen käynnistysnäytöt"
      },
      {
        value: "browsing lists",
        displayName: "selailunäytöt"
      }
    ],
  },
  {
    className: "Interactive end-user input service",
    componentTypeOptions: [
      {
        value: "1-functional",
        displayName: "1-toimiset"
      },
      {
        value: "2-functional",
        displayName: "2-toimiset"
      },
      {
        value: "3-functional",
        displayName: "3-toimiset"
      }
    ],
  },
  {
    className: "Non-interactive end-user output service",
    componentTypeOptions: [
      {
        value: "forms",
        displayName: "Lomaketulosteet"
      },
      {
        value: "reports",
        displayName: "Raportit"
      },
      {
        value: "emails for text messages",
        displayName: "Sähköposti- tai tekstiviestit"
      },
      {
        value: "monitor screens",
        displayName: "Näyttötulosteet"
      }
    ]
  },
  {
    className: "Interface service to other applications",
    componentTypeOptions: [
      {
        value: "messages to other applications",
        displayName: "Lähetettävät sanomat"
      },
      {
        value: "batch records to other applications",
        displayName: "Lähetettävät erätietueet"
      },
      {
        value: "signals to devices or other applications",
        displayName: "Lähetettävät signaalit"
      }
    ]
  },
  {
    className: "Interface service from other applications",
    componentTypeOptions: [
      {
        value: "messages from other applications",
        displayName: "Vastaanotettavat sanomat"
      },
      {
        value: "batch records from other applications",
        displayName: "Vastaanotettavat erätietueet"
      },
      {
        value: "signals from devices or other applications",
        displayName: "Vastaanotettavat signaalit"
      }
    ]
  },
  {
    className: "Data storage service",
    componentTypeOptions: [
      {
        value: "entities or classes",
        displayName: "Käsitteet tai luokat"
      },
      {
        value: "other record types",
        displayName: "Muut tietuetyypit"
      }
    ],
  },
  {
    className: "Algorithmic or manipulation service",
    componentTypeOptions: [
      {
        value: "security routines",
        displayName: "Turvallisuusrutiinit"
      },
      {
        value: "calculation routines",
        displayName: "Laskentarutiinit"
      },
      {
        value: "simulation routines",
        displayName: "Simulointirutiinit"
      },
      {
        value: "formatting routines",
        displayName: "Muotoilurutiinit"
      },
      {
        value: "database cleaning routines",
        displayName: "Tietokannan hoitorutiinit"
      },
      {
        value: "other manipulation routines",
        displayName: "Muut käsittelyrutiinit"
      }
    ]
  }
];

export const parameterDisplayNames = {
  dataElements: "Tietoelementit",
  writingReferences: "Kirjoitusviittaukset",
  readingReferences: "Lukuviittaukset",
  operations: "Operaatiot"
};

export type TParameterDisplayNames = typeof parameterDisplayNames;

export const calculateFunctions = [
  {
    className: "Interactive end-user navigation and query service",
    calculateFunction: calculateInteractiveEndUserNavigationAndQueryService
  },
  {
    className: "Interactive end-user input service",
    calculateFunction: calculateInteractiveEndUserInputService,
  },
  {
    className: "Non-interactive end-user output service",
    calculateFunction: calculateNonInteractiveEndUserOutputService
  },
  {
    className: "Interface service to other applications",
    calculateFunction: calculateInterfaceServiceToOtherApplications
  },
  {
    className: "Interface service from other applications",
    calculateFunction: calculateInterfaceServiceFromOtherApplications
  },
  {
    className: "Data storage service",
    calculateFunction: calculateDataStorageService,
  },
  {
    className: "Algorithmic or manipulation service",
    calculateFunction: calculateAlgorithmicOrManipulationService
  }
];