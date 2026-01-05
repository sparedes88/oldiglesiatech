export class ToDoModel{
    idToDo: number;
    name: string;
    description: string;
    idToDoType: number;
    value: string;
    accomplished: boolean;
    reviewed: boolean;
    accomplished_by: number;
    accomplished_by_name: string; 
    reviewed_by: number;
    reviewed_by_name: string;
    status: boolean;
    created_at: Date | string;
    created_by: number;
    deleted_by: number;
    deleted_at: Date; 
}

export class ToDoTypeModel{
    idToDoType: number;
    name: string;
    description: string;
    status: boolean;
    created_at: Date | string;
    created_by: number;
    deleted_by: number;
    deleted_at: Date; 
}
