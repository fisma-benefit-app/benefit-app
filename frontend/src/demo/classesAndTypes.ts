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
        "function designators",
        "log-in, log-out functions",
        "function lists",
        "selection lists",
        "data inquiries",
        "generation indicators",
        "browsing lists",
    ],
    "Interactive end-user input service": [
        "1-functional",
        "2-functional",
        "3-functional"
    ],
    "Non-interactive end-user output service": [
        "forms",
        "reports",
        "emails for text messages",
        "monitor screens"
    ],
    "Interface service to other applications": [
        "messages to other applications",
        "batch records to other applications",
        "signals to devices or other applications"
    ],
    "Interface service from other applications": [
        "messages from other applications",
        "batch records from other applications",
        "signals from devices or other applications"
    ],
    "Data storage service": [
        "entities or classes",
        "other record types"
    ],
    "Algorithmic or manipulation service": [
        "security routines",
        "calculation routines",
        "simulation routines",
        "formatting routines",
        "database cleaning routines",
        "other manipulation routines"
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

//type for componentClassInputs
export type ClassInputs = typeof componentClassInputs;

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
