export interface ValidationErrors {
    [key: string]: ErrorTypes
}

interface ErrorTypes {
    required?: string;
    minlength?: string;
    maxlength?: string;
    pattern?: string;
    email?: string
}

