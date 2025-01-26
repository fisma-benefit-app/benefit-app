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

//type for baseFunctionalComponentTypes
export type ComponentTypes = typeof baseFunctionalComponentTypes;