import { AsnProp, AsnPropTypes, AsnType, AsnTypeTypes, AsnConvert, AsnArray } from "@peculiar/asn1-schema";

const etsi_psd2_prefix = "0.4.0.19495";
export const id_etsi_qcs_psd2 = `${etsi_psd2_prefix}.2`;
const id_etsi_qcs_psd2_psp_as = `${etsi_psd2_prefix}.1.1`;
const id_etsi_qcs_psd2_psp_pi = `${etsi_psd2_prefix}.1.2`;
const id_etsi_qcs_psd2_psp_ai = `${etsi_psd2_prefix}.1.3`;
const id_etsi_qcs_psd2_psp_ic = `${etsi_psd2_prefix}.1.4`;

// Define Psd2Role
export enum Psd2RoleType {
    PSP_AS = id_etsi_qcs_psd2_psp_as,
    PSP_PI = id_etsi_qcs_psd2_psp_pi,
    PSP_AI = id_etsi_qcs_psd2_psp_ai,
    PSP_IC = id_etsi_qcs_psd2_psp_ic,
}

@AsnType({ type: AsnTypeTypes.Sequence })
export class Psd2Role {
    @AsnProp({ type: AsnPropTypes.ObjectIdentifier })
    public roleOfPsp!: Psd2RoleType;

    @AsnProp({
        type: AsnPropTypes.Utf8String,
        optional: true
    })
    public roleOfPspName?: string;

    constructor(params: Partial<Psd2Role> = {}) {
        Object.assign(this, params);
    }
}

// Define Psd2RolesList
@AsnType({ type: AsnTypeTypes.Sequence, itemType: Psd2Role })
export class Psd2RolesList extends AsnArray<Psd2Role> {
    constructor(items?: Psd2Role[]) {
        super(items);
        Object.setPrototypeOf(this, Psd2RolesList.prototype);
    }
}

// Define qcPsd2RolesInfo
@AsnType({ type: AsnTypeTypes.Sequence })
export class QcPsd2RolesInfo {
    @AsnProp({ type: Psd2RolesList })
    public psd2Roles = new Psd2RolesList();

    @AsnProp({
        type: AsnPropTypes.Utf8String,
        optional: true
    })
    public ncaName?: string;

    @AsnProp({
        type: AsnPropTypes.Utf8String,
        optional: true
    })
    public ncaId?: string;

    constructor(params: Partial<QcPsd2RolesInfo> = {}) {
        Object.assign(this, params);
    }
}
