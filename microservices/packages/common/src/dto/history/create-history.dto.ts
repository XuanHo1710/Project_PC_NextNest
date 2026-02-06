export class CreateHistoryDto {
    adminId: string;
    adminName: string;
    method: string;
    path: string;
    body?: any;
    description?: string;
}
