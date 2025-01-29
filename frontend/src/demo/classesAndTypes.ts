//array of all base functional component classes, used to render the options for corresponding select field
export const baseFunctionalComponentClasses: string[] = [
    "Interactive end-user navigation and query service",
    "Interactive end-user input service",
    "Non-interactive end-user output service",
    "Interface service to other applications",
    "Interface service from other applications",
    "Data storage service",
    "Algorithmic or manipulation service"
]

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
export const componentClassFields = {
    "Interactive end-user navigation and query service": [
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
        {
            name: "readingReferences",
            uiName: "Reading References"
        }
    ],
    "Interactive end-user input service": [
        {
            name: "functionalityMultiplier",
            uiName: "Functionality Multiplier"
        },
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
        {
            name: "writingReferences",
            uiName: "Writing References"
        },
        {
            name: "readingReferences",
            uiName: "Reading References"
        }
    ],
    "Non-interactive end-user output service": [
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
        {
            name: "readingReferences",
            uiName: "Reading References"
        }
    ],
    "Interface service to other applications": [
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
        {
            name: "readingReferences",
            uiName: "Reading References"
        }
    ],
    "Interface service from other applications": [
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
        {
            name: "writingReferences",
            uiName: "Writing References"
        },
        {
            name: "readingReferences",
            uiName: "Reading References"
        }
    ],
    "Data storage service": [
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
    ],
    "Algorithmic or manipulation service": [
        {
            name: "dataElements",
            uiName: "Data Elements",
        },
        {
            name: "operations",
            uiName: "Operations"
        }
    ]
}

//type for baseFunctionalComponentTypes
export type ComponentTypes = typeof baseFunctionalComponentTypes;

//type for componentClassFields
export type ClassFields = typeof componentClassFields;