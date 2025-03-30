import { Extension } from "@peculiar/x509";
import { AsnConvert } from "@peculiar/asn1-schema";
import { QCStatements, QCStatement, id_pe_qcStatements } from "@peculiar/asn1-x509-qualified";
import { id_etsi_qcs_qcCompliance, id_etsi_qcs_qcType, id_etsi_qct_web, id_etsi_qcs_qcPDS, PdsLocation, QcType, PdsLocations } from "@peculiar/asn1-x509-qualified-etsi";
import { id_etsi_qcs_psd2, Psd2Role, Psd2RolesList, Psd2RoleType, QcPsd2RolesInfo } from "./psd2QcType";


// QCStatements extension class
export class QCStatementsExtension extends Extension {
    public readonly statements: QCStatements;

    constructor(statements: QCStatements) {
        super(
            id_pe_qcStatements, // "1.3.6.1.5.5.7.1.3", // id-pe-qcStatements OID
            false, // critical
            AsnConvert.serialize(statements)
        );

        this.statements = statements;
    }
}

export function createQCStatements(): QCStatements {
    // Define QCStatement for qcCompliance
    const qcComplianceStatement = new QCStatement();
    qcComplianceStatement.statementId = id_etsi_qcs_qcCompliance; // ETSI QC Compliance (0.4.0.1862.1.1)
    (qcComplianceStatement as any).statementInfo = undefined;

    // Define QCStatement for qcType
    const qcTypeStatement = new QCStatement();
    qcTypeStatement.statementId = id_etsi_qcs_qcType; // ETSI QC Type (0.4.0.1862.1.6)
    qcTypeStatement.statementInfo = AsnConvert.serialize(
        new QcType([
            id_etsi_qct_web // id_etsi_qct_web (0.4.0.1862.1.6.3)
        ])
    );

    // Create PdsLocation for QcPDS
    const pds = new PdsLocation({
        url: "https://example.com/pds", // Replace with your actual PDS URL
        language: "en",                 // Optional, e.g., "en" for English
    });

    // Define QCStatement for qcPDS
    const qcPDSStatement = new QCStatement();
    qcPDSStatement.statementId = id_etsi_qcs_qcPDS; // ETSI QC PDS (0.4.0.1862.1.5)
    qcPDSStatement.statementInfo = AsnConvert.serialize(new PdsLocations([pds])); // Example value

    const qcPsd2Roles = new QcPsd2RolesInfo({
        psd2Roles: new Psd2RolesList([
            new Psd2Role({
                roleOfPsp: Psd2RoleType.PSP_PI
            }),
            new Psd2Role({
                roleOfPsp: Psd2RoleType.PSP_AI
            })            
        ]),
        ncaId: 'XX-DFSA',
        ncaName: 'Dummy Financial Supervision Authority'
    });


    // Define QCStatement for PSD2
    const qcPsd2Statement = new QCStatement();
    qcPsd2Statement.statementId = id_etsi_qcs_psd2;
    qcPsd2Statement.statementInfo = AsnConvert.serialize(qcPsd2Roles);

    const qcStatements = new QCStatements(
        [qcComplianceStatement, qcTypeStatement, qcPDSStatement, qcPsd2Statement]
    );

    return qcStatements;
};
