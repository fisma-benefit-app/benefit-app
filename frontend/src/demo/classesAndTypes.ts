//array of all base functional component classes, used to render the options for corresponding select field
export const baseFunctionalComponentClasses = [
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
]

//object for storing all base functional component types for corresponding class, used to render the options for corresponding select field
export const baseFunctionalComponentTypes = {
    "Interactive end-user navigation and query service": [
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
    "Interactive end-user input service": [
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
    "Non-interactive end-user output service": [
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
    ],
    "Interface service to other applications": [
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
    ],
    "Interface service from other applications": [
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
    ],
    "Data storage service": [
        {
            value: "entities or classes",
            displayName: "Käsitteet tai luokat"
        },
        {
            value: "other record types",
            displayName: "Muut tietuetyypit"
        }
    ],
    "Algorithmic or manipulation service": [
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

//object for storing the rendered input fields info depending on selected component class
//todo implement conditional rendering using this
export const componentClassInputs = [
    {
        inputName: "dataElements",
        displayName: "Tietoelementtien määrä",
        componentClasses: [
            "Interactive end-user navigation and query service",
            "Interactive end-user input service",
            "Non-interactive end-user output service",
            "Interface service to other applications",
            "Interface service from other applications",
            "Data storage service",
            "Algorithmic or manipulation service"
        ]
    },
    {
        inputName: "readingReferences",
        displayName: "Lukuviittaukset",
        componentClasses: [
            "Interactive end-user navigation and query service",
            "Interactive end-user input service",
            "Non-interactive end-user output service",
            "Interface service to other applications",
            "Interface service from other applications"
        ]
    },
    {
        inputName: "writingReferences",
        displayName: "Kirjoitusviittaukset",
        componentClasses: [
            "Interactive end-user input service",
            "Interface service from other applications",
        ]
    },
    {
        inputName: "functionalityMultiplier",
        displayName: "Toimintokerroin",
        componentClasses: [
            "Interactive end-user input service",
        ]
    },
    {
        inputName: "operations",
        displayName: "Operaatiot",
        componentClasses: [
            "Algorithmic or manipulation service"
        ]
    }
]

//type for baseFunctionalComponentTypes
export type ComponentTypes = typeof baseFunctionalComponentTypes;

//maybe using this object and dot notation it's easier to write each class correctly in the future
export const componentClassesObject = {
    "Interactive end-user navigation and query service": "Interactive end-user navigation and query service",
    "Interactive end-user input service": "Interactive end-user input service",
    "Non-interactive end-user output service": "Non-interactive end-user output service",
    "Interface service to other applications": "Interface service to other applications",
    "Interface service from other applications": "Interface service from other applications",
    "Data storage service": "Data storage service",
    "Algorithmic or manipulation service": "Algorithmic or manipulation service"
}
