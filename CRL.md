## Manually validate certificate against CRL

### 1. **Basic Certificate Validation**
   - **Check Validity Period**: Ensure the certificate is within its validity window (not expired and active).
   - **Verify Certificate Chain**: Confirm the certificate is signed by a trusted CA, including any intermediates.

   **OpenSSL Command**:
   ```bash
   openssl verify -CAfile ca.pem cert.pem
   ```
   - `ca.pem`: Contains the root and intermediate CA certificates.
   - `cert.pem`: The certificate to validate.

### 2. **Download the CRL**
   - Retrieve the CRL from the provided endpoint (e.g., using `curl` or `wget`).

   **Example**:
   ```bash
   curl -o crl.der http://pki.example.com/crl
   ```

### 3. **Convert CRL to PEM Format (if needed)**
   - If the CRL is in DER format, convert it to PEM.

   **OpenSSL Command**:
   ```bash
   openssl crl -inform DER -in crl.der -outform PEM -out crl.pem
   ```

### 4. **Validate the CRL**
   - **Check CRL Signature**: Ensure the CRL is signed by the CA.
   - **Check CRL Validity**: Verify the CRL hasn't expired.

   **OpenSSL Commands**:
   ```bash
   # Verify CRL signature
   openssl crl -in crl.pem -CAfile ca.pem -noout

   # Check CRL validity dates
   openssl crl -in crl.pem -noout -text | grep -E "Next Update|Last Update"
   ```

### 5. **Check Certificate Against CRL**
   - **Extract Certificate Serial Number**:
     ```bash
     openssl x509 -in cert.pem -noout -serial
     ```
   - **List Revoked Serials in CRL**:
     ```bash
     openssl crl -in crl.pem -noout -text | grep "Serial Number"
     ```
   - **Manually compare** the certificate's serial number with those in the CRL.

## Automatically validate certificate against CRL

### **Step-by-Step with OpenSSL**
1. **Basic Certificate Validation with CRL Check**:
   Use the following command to:
   - Validate the certificate chain.
   - Download the CRL from the URL in the certificate's `CRLDistributionPoints` extension.
   - Check if the certificate is revoked.

   ```bash
   openssl verify -crl_check -crl_download -CAfile ca.pem cert.pem
   ```

   **Flags**:
   - `-crl_check`: Enable CRL validation.
   - `-crl_download`: Automatically fetch the CRL from the URL specified in the certificate.
   - `-CAfile ca.pem`: Trusted root/intermediate CA certificate(s) (required for chain validation).

   If the certificate is valid and not revoked, you'll see:
   ```
   cert.pem: OK
   ```

   If revoked:
   ```
   cert.pem: CN = revoked.example.com
   error 23 at 0 depth lookup: certificate revoked
   ```

## CRL response format

The **CRL endpoint** (as specified in the certificate's `CRLDistributionPoints` extension) should return the Certificate Revocation List (CRL) with the appropriate **Content-Type** header. The correct MIME type depends on the format of the CRL:

---

### **1. For DER-Encoded CRL (Binary Format)**
- **Content-Type**: `application/pkix-crl`  
  This is the **standard MIME type** for DER-encoded CRLs, as defined in [RFC 2585](https://tools.ietf.org/html/rfc2585).  
  Example HTTP response headers:
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/pkix-crl
  Content-Length: 1234
  ```

- **Why DER?**  
  Most CRL endpoints serve CRLs in **DER format** by default (binary), which is the standard for PKI systems.

---

### **2. For PEM-Encoded CRL (Base64 Text Format)**
- **Content-Type**: `text/plain` or `application/x-pem-file`  
  PEM is a text-based format, but there is no officially registered MIME type for PEM-encoded CRLs. Some systems use `text/plain` or `application/x-pem-file`.  
  Example HTTP response headers:
  ```http
  HTTP/1.1 200 OK
  Content-Type: text/plain
  Content-Length: 2000
  ```

- **Why PEM?**  
  PEM is human-readable and easier to debug, but it’s less common for CRL distribution compared to DER.

---

### **Key Notes**
1. **OpenSSL Compatibility**:
   - When using `openssl verify -crl_download`, OpenSSL automatically handles both DER and PEM formats **regardless of the `Content-Type` header**. It inspects the actual content to determine the format.
   - However, adhering to the correct `Content-Type` ensures interoperability with other PKI clients/tools.

2. **Common Pitfalls**:
   - Misconfigured servers might return `application/octet-stream` (generic binary) or even `text/html` (if there’s an error page). This can cause issues with strict PKI clients.
   - Always validate the CRL endpoint with tools like `curl` or `openssl` to check headers and content:
     ```bash
     curl -I http://pki.example.com/crl  # Check headers
     curl http://pki.example.com/crl | openssl crl -inform DER -noout -text  # Validate CRL content
     ```

3. **Server Configuration**:
   - For **Apache/Nginx**, explicitly set the MIME type for CRL files.  
     Example for DER-encoded CRLs in Nginx:
     ```nginx
     location /crl {
       types { application/pkix-crl crl; }
       alias /path/to/crl.der;
     }
     ```

---

### **Legacy Systems**
Some older systems might use deprecated MIME types like `application/x-x509-crl`, but **`application/pkix-crl`** is the modern standard.

---

### **Summary**
- Use **`application/pkix-crl`** for DER-encoded CRLs.  
- Use **`text/plain`** or **`application/x-pem-file`** for PEM-encoded CRLs.  
- Always test your endpoint with tools like `curl` or `openssl` to ensure compatibility.