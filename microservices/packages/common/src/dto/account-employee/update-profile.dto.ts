export class UpdateProfileDto {
    name?: string;
    avatar?: string;
    age?: number;
    gender?: string;
    addresses?: {
        label: string;
        province: { code: number; name: string };
        district: { code: number; name: string };
        ward: { code: number; name: string };
        detailAddress: string;
        isDefault: boolean;
    }[];
}
