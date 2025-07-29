import { Extension, X509Certificate } from "@peculiar/x509";
import { AsnConvert, AsnParser } from "@peculiar/asn1-schema";
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

export function createQCStatements(psd2Roles: string[]): QCStatements {
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
        psd2Roles: new Psd2RolesList(psd2Roles.map(
            role => new Psd2Role({
                roleOfPsp: Psd2RoleType[role.toUpperCase() as keyof typeof Psd2RoleType]
            }))),
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

export function extractRoles(certString: string): string[] {
    const certificate = new X509Certificate(certString);

    // 1. pick the qcStatements extension
    const qcStatementsExt = certificate.getExtension<QCStatementsExtension>(id_pe_qcStatements);
    if (!qcStatementsExt) {
        console.log("No qcStatements extension found");
        return [];
    }

    // 2. parse the extension
    const qcStatements = AsnParser.parse(qcStatementsExt.value, QCStatements);

    // 3. find the qcPsd2Statement
    const psd2Statement = qcStatements.find(
        stmt => stmt.statementId === id_etsi_qcs_psd2 // "0.4.0.1862.1.4" for ETSI PSD2
    );

    if (!psd2Statement) {
        console.log("No qcPsd2Statement found");
    }

    // 5. decode the roles
    const rolesInfo = AsnConvert.parse(psd2Statement.statementInfo, QcPsd2RolesInfo);
    if (!rolesInfo || !rolesInfo.psd2Roles) {
        console.log("No roles found in qcPsd2Statement");
        return [];
    }

    console.log(rolesInfo.psd2Roles);
    return rolesInfo.psd2Roles.map(role => role.roleOfPspName || role.roleOfPsp);

}
