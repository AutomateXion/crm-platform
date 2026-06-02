import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesInvoiceEntity } from './sales.entities';
import * as crypto from 'crypto';

@Injectable()
export class EInvoiceService {
  constructor(
    @InjectRepository(SalesInvoiceEntity) private invoiceRepo: Repository<SalesInvoiceEntity>,
  ) {}

  // ── Generate UUID for invoice ─────────────────────────────
  generateUUID(): string {
    return crypto.randomUUID();
  }

  // ── Generate UBL 2.1 XML Invoice (Peppol BIS 3.0) ────────
  generateUBLXML(invoice: any, company: any, settings: any): string {
    const now = new Date();
    const issueDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().slice(0,10) : now.toISOString().slice(0,10);
    const issueTime = now.toISOString().slice(11,19);
    const uuid = invoice.eInvoiceUuid || this.generateUUID();

    const lines = (invoice.items || []).map((item: any, idx: number) => `
    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="${item.unitOfMeasure || 'PCE'}">${Number(item.quantity || 0).toFixed(3)}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="OMR">${Number(item.lineTotal || 0).toFixed(3)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Name>${this.escapeXML(item.description || '')}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${item.isTaxable !== false ? '5.00' : '0.00'}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="OMR">${Number(item.unitPrice || 0).toFixed(3)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">

  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${this.escapeXML(invoice.invoiceNumber || '')}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:DueDate>${invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0,10) : issueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>OMR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>OMR</cbc:TaxCurrencyCode>
  <cbc:BuyerReference>${this.escapeXML(invoice.customerName || '')}</cbc:BuyerReference>

  <!-- Seller (Corner 1) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${this.escapeXML(company.companyName || 'My Company')}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${this.escapeXML(company.addressLine1 || '')}</cbc:StreetName>
        <cbc:CityName>${this.escapeXML(company.city || 'Muscat')}</cbc:CityName>
        <cbc:CountrySubentity>Muscat</cbc:CountrySubentity>
        <cac:Country><cbc:IdentificationCode>OM</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${this.escapeXML(company.trn || '')}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.escapeXML(company.companyName || '')}</cbc:RegistrationName>
        <cbc:CompanyID>${this.escapeXML(company.trn || '')}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:ElectronicMail>${this.escapeXML(company.email || '')}</cbc:ElectronicMail>
        <cbc:Telephone>${this.escapeXML(company.phone || '')}</cbc:Telephone>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Buyer (Corner 4) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${this.escapeXML(invoice.customerName || '')}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${this.escapeXML(invoice.customerAddress || '')}</cbc:StreetName>
        <cbc:CityName>Muscat</cbc:CityName>
        <cac:Country><cbc:IdentificationCode>OM</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${this.escapeXML(invoice.customerTrn || '')}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.escapeXML(invoice.customerName || '')}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:ElectronicMail>${this.escapeXML(invoice.customerEmail || '')}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="OMR">${Number(invoice.vatAmount || 0).toFixed(3)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="OMR">${Number(invoice.subtotal || 0).toFixed(3)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="OMR">${Number(invoice.vatAmount || 0).toFixed(3)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>5.00</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Monetary Totals -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="OMR">${Number(invoice.subtotal || 0).toFixed(3)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="OMR">${Number(invoice.subtotal || 0).toFixed(3)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="OMR">${Number(invoice.totalAmount || 0).toFixed(3)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="OMR">${Number(invoice.totalAmount || 0).toFixed(3)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Line Items -->
  ${lines}

</Invoice>`;
  }

  // ── Generate Credit Note XML ──────────────────────────────
  generateCreditNoteXML(invoice: any, company: any): string {
    const xml = this.generateUBLXML(invoice, company, {});
    return xml
      .replace('<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>', '<cbc:InvoiceTypeCode>381</cbc:InvoiceTypeCode>')
      .replace('<Invoice ', '<CreditNote ')
      .replace('</Invoice>', '</CreditNote>');
  }

  // ── Hash XML content ──────────────────────────────────────
  hashXML(xml: string): string {
    return crypto.createHash('sha256').update(xml).digest('hex');
  }

  // ── Validate UBL XML ──────────────────────────────────────
  validateUBL(xml: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const required = ['cbc:ID', 'cbc:UUID', 'cbc:IssueDate', 'cbc:InvoiceTypeCode',
      'cbc:DocumentCurrencyCode', 'cac:AccountingSupplierParty', 'cac:AccountingCustomerParty',
      'cac:TaxTotal', 'cac:LegalMonetaryTotal', 'cac:InvoiceLine'];
    for (const field of required) {
      if (!xml.includes(`<${field}>`)) errors.push(`Missing required field: ${field}`);
    }
    return { valid: errors.length === 0, errors };
  }

  // ── Save submission record ────────────────────────────────
  async saveSubmission(tenantId: string, invoiceId: string, invoiceNumber: string, xml: string, transactionType = 'B2B') {
    const hash = this.hashXML(xml);
    const uuid = this.generateUUID();
    await this.invoiceRepo.query(
      `INSERT INTO einvoice_submissions (tenant_id, invoice_id, invoice_number, invoice_uuid, transaction_type, xml_content, xml_hash, submission_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING')
       ON CONFLICT DO NOTHING`,
      [tenantId, invoiceId, invoiceNumber, uuid, transactionType, xml, hash]
    );
    return { uuid, hash };
  }

  // ── Get submission status ─────────────────────────────────
  async getSubmissions(tenantId: string, page = 1, limit = 20) {
    const sql = `
      SELECT es.*, 
        CASE es.submission_status 
          WHEN 'PENDING' THEN '⏳ Pending'
          WHEN 'SUBMITTED' THEN '📤 Submitted'
          WHEN 'ACKNOWLEDGED' THEN '✅ Acknowledged'
          WHEN 'CLEARED' THEN '🟢 Cleared'
          WHEN 'REJECTED' THEN '❌ Rejected'
          ELSE es.submission_status
        END as status_label
      FROM einvoice_submissions es
      WHERE es.tenant_id = $1
      ORDER BY es.created_at DESC
      LIMIT $2 OFFSET $3`;
    const total = await this.invoiceRepo.query(`SELECT COUNT(*) FROM einvoice_submissions WHERE tenant_id=$1`, [tenantId]);
    const data = await this.invoiceRepo.query(sql, [tenantId, limit, (page-1)*limit]);
    return { data, total: Number(total[0].count) };
  }

  // ── Get e-invoice settings ────────────────────────────────
  async getSettings(tenantId: string) {
    const result = await this.invoiceRepo.query(
      `SELECT * FROM einvoice_settings WHERE tenant_id=$1`, [tenantId]
    );
    return result[0] || { tenantId, isEnabled: false, testMode: true, autoSubmit: false };
  }

  // ── Save e-invoice settings ───────────────────────────────
  async saveSettings(tenantId: string, dto: any) {
    await this.invoiceRepo.query(`
      INSERT INTO einvoice_settings (tenant_id, seller_uuid, peppol_participant_id, asp_endpoint, asp_api_key, asp_name, is_enabled, test_mode, auto_submit)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (tenant_id) DO UPDATE SET
        seller_uuid=$2, peppol_participant_id=$3, asp_endpoint=$4, asp_api_key=$5,
        asp_name=$6, is_enabled=$7, test_mode=$8, auto_submit=$9, updated_at=NOW()`,
      [tenantId, dto.sellerUuid||null, dto.peppolParticipantId||null, dto.aspEndpoint||null,
       dto.aspApiKey||null, dto.aspName||null, dto.isEnabled||false, dto.testMode||true, dto.autoSubmit||false]
    );
    return this.getSettings(tenantId);
  }

  // ── Generate invoice XML for download ────────────────────
  async generateInvoiceXML(tenantId: string, invoiceId: string) {
    const invoices = await this.invoiceRepo.query(
      `SELECT i.*, 
        json_agg(json_build_object(
          'description', ii.description, 'quantity', ii.quantity,
          'unitPrice', ii.unit_price, 'lineTotal', ii.line_total,
          'unitOfMeasure', ii.unit_of_measure, 'isTaxable', ii.is_taxable
        )) as items
       FROM sales_invoices i
       LEFT JOIN invoice_items ii ON ii.invoice_id = i.invoice_id
       WHERE i.invoice_id=$1 AND i.tenant_id=$2
       GROUP BY i.invoice_id`, [invoiceId, tenantId]
    );
    if (!invoices.length) throw new Error('Invoice not found');
    const invoice = invoices[0];

    const settingResult = await this.invoiceRepo.query(
      `SELECT * FROM tenants WHERE tenant_id=$1`, [tenantId]
    );
    const company = settingResult[0] || {};

    const xml = this.generateUBLXML(invoice, company, {});
    const validation = this.validateUBL(xml);
    await this.saveSubmission(tenantId, invoiceId, invoice.invoice_number, xml,
      invoice.customer_trn ? 'B2B' : 'B2C');
    return { xml, validation, invoiceNumber: invoice.invoice_number };
  }

  // ── Escape XML special characters ────────────────────────
  private escapeXML(str: string): string {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
