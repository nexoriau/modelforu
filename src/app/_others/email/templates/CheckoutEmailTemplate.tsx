// utils/email-templates.ts
import { UserTableType } from '@/db/schema/auth';
import { SubscriptionHistoryTableType } from '@/db/schema/subscription-history';
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import { formatCurrency } from '@/lib/utils-functions/formatCurrency';
import React from 'react';

interface CheckoutEmailTemplateProps {
  planName: string;
  quantity: number;
  price: string;
  type: string;
  total: number;
  tokensAdded: number;
  customerEmail: string;
}

export const CheckoutEmailTemplate = ({
  planName,
  quantity,
  price,
  total,
  tokensAdded,
  type,
  customerEmail,
}: CheckoutEmailTemplateProps) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headerStyle}>Thank You for Your Purchase!</h1>
      <p style={textStyle}>
        Your transaction was successful and {tokensAdded} {type}s have been
        added to your account.
      </p>

      <div style={detailsContainer}>
        <div style={detailRow}>
          <span style={labelStyle}>Plan: </span>
          <span style={valueStyle}>{planName}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Credits: </span>
          <span style={valueStyle}>{quantity}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Unit Price: </span>
          <span style={valueStyle}>${price}</span>
        </div>
        <div
          style={{
            ...detailRow,
            borderTop: '1px solid #eee',
            paddingTop: '12px',
          }}
        >
          <span style={{ ...labelStyle, fontWeight: 'bold' }}>Total: </span>
          <span style={{ ...valueStyle, fontWeight: 'bold' }}>
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <p style={textStyle}>
        You can start using your {type}s immediately in your account dashboard.
        If you have any questions about your purchase, reply to this email.
      </p>

      <div style={footerStyle}>
        <p style={textStyle}>Happy creating!</p>
        <p style={{ ...textStyle, marginTop: '4px' }}>
          The <span style={{ color: '#4a569d' }}>Model For You</span> Team
        </p>
      </div>
    </div>
  </div>
);

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: '#f7f9fc',
  padding: '24px',
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const cardStyle: React.CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const headerStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1a202c',
  marginBottom: '24px',
  textAlign: 'center',
};

const textStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#4a5568',
  marginBottom: '20px',
};

const detailsContainer: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#718096',
};

const valueStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#1a202c',
  fontWeight: 500,
};

const footerStyle: React.CSSProperties = {
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: '1px solid #edf2f7',
  textAlign: 'center',
};

interface CheckoutEmailWithInvoiceProps extends CheckoutEmailTemplateProps {
  transaction?: SubscriptionHistoryTableType;
  currentUser?: UserTableType;
}

export const CheckoutEmailWithInvoice = ({
  planName,
  quantity,
  price,
  total,
  tokensAdded,
  type,
  currentUser,
  transaction,
}: CheckoutEmailWithInvoiceProps) => {
  // --- Helper logic adapted from your PDF/Invoice generator ---
  const hasUserInfo =
    transaction?.companyName ||
    transaction?.companyAddress ||
    transaction?.userEmail ||
    transaction?.vatNumber;

  let invoiceNumber = '';
  if (transaction?.invoiceId) {
    invoiceNumber =
      transaction?.invoiceId.length > 20
        ? `${transaction?.invoiceId.substring(0, 17)}...`
        : transaction?.invoiceId;
  } else if (transaction?.id) {
    invoiceNumber =
      transaction?.id.length > 20
        ? `${transaction?.id.substring(0, 17)}...`
        : transaction?.id;
  }

  const createdDate = transaction?.createdDate
    ? dateFormatter(transaction?.createdDate, 'MMMM DD, YYYY')
    : '';

  let description = transaction?.description || 'Service';
  if (transaction?.source === 'subscription') {
    description = 'Subscriptions';
  }

  let period = '';
  if (
    transaction?.source === 'subscription' &&
    transaction?.createdDate &&
    transaction?.currentPeriodEnd
  ) {
    const periodStart = dateFormatter(transaction?.createdDate, 'MMM DD, YYYY');
    const periodEnd = dateFormatter(
      transaction?.currentPeriodEnd,
      'MMM DD, YYYY'
    );
    period = `${periodStart} – ${periodEnd}`;
  }

  // Use invoice quantity/price, fallback to checkout props if needed
  const invoiceQuantity = transaction?.tokenQuantity
    ? transaction?.tokenQuantity.toString()
    : quantity.toString();
  const invoicePrice = transaction?.price ? +transaction?.price : total;
  const unitPrice = formatCurrency(invoicePrice);
  const amount = formatCurrency(invoicePrice);

  // --- Component render ---
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* === CHECKOUT RECEIPT PART === */}
        <h1 style={headerStyle}>Thank You for Your Purchase!</h1>
        <p style={textStyle}>
          Your transaction was successful and {tokensAdded} {type}s have been
          added to your account.
        </p>

        <div style={detailsContainer}>
          <div style={detailRow}>
            <span style={labelStyle}>Plan: </span>
            <span style={valueStyle}>{planName}</span>
          </div>
          <div style={detailRow}>
            <span style={labelStyle}>Credits: </span>
            <span style={valueStyle}>{quantity}</span>
          </div>
          <div style={detailRow}>
            <span style={labelStyle}>Unit Price: </span>
            <span style={valueStyle}>${price}</span>
          </div>
          <div
            style={{
              ...detailRow,
              borderTop: '1px solid #eee',
              paddingTop: '12px',
            }}
          >
            <span style={{ ...labelStyle, fontWeight: 'bold' }}>Total: </span>
            <span style={{ ...valueStyle, fontWeight: 'bold' }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <p style={textStyle}>
          You can start using your {type}s immediately in your account
          dashboard. If you have any questions about your purchase, reply to
          this email.
        </p>

        {/* === INVOICE & FOOTER PART === */}
        <div style={footerStyle}>
          {/* --- INVOICE DETAILS --- */}
          <h2
            style={{
              ...headerStyle,
              fontSize: '20px',
              textAlign: 'left',
              marginBottom: '24px',
              marginTop: 0,
            }}
          >
            Receipt & Invoice
          </h2>

          {/* Company Info & Invoice Details */}
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ marginBottom: '30px', textAlign: 'left' }}
          >
            <tbody>
              <tr>
                {/* Company Info (Left) */}
                <td
                  style={{ width: '60%', verticalAlign: 'top', ...textStyle }}
                >
                  {hasUserInfo ? (
                    <>
                      {transaction.companyName && (
                        <strong
                          style={{
                            fontSize: '16px',
                            color: '#1a202c',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          {transaction.companyName}
                        </strong>
                      )}
                      {transaction.companyAddress && (
                        <div
                          style={{
                            whiteSpace: 'pre-line',
                            lineHeight: '1.4',
                            marginBottom: '4px',
                          }}
                        >
                          {transaction.companyAddress}
                        </div>
                      )}
                      {transaction.userEmail && (
                        <div style={{ marginBottom: '4px' }}>
                          {transaction.userEmail}
                        </div>
                      )}
                      {transaction.vatNumber && (
                        <div>VAT: {transaction.vatNumber}</div>
                      )}
                    </>
                  ) : (
                    <>&nbsp;</>
                  )}
                </td>

                {/* Invoice Details (Right) */}
                <td style={{ width: '40%', verticalAlign: 'top' }}>
                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{ ...textStyle, fontSize: '15px' }}
                  >
                    <tbody>
                      {invoiceNumber && (
                        <tr style={{ verticalAlign: 'top' }}>
                          <td style={{ paddingBottom: '6px', ...labelStyle }}>
                            Invoice number
                          </td>
                          <td
                            style={{
                              paddingBottom: '6px',
                              textAlign: 'right',
                              ...valueStyle,
                            }}
                          >
                            {invoiceNumber}
                          </td>
                        </tr>
                      )}
                      {createdDate && (
                        <tr style={{ verticalAlign: 'top' }}>
                          <td style={{ paddingBottom: '6px', ...labelStyle }}>
                            Date of issue
                          </td>
                          <td
                            style={{
                              paddingBottom: '6px',
                              textAlign: 'right',
                              ...valueStyle,
                            }}
                          >
                            {createdDate}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bill To */}
          {currentUser && (currentUser.name || currentUser.email) && (
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <strong
                style={{
                  fontSize: '14px',
                  color: '#1a202c',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Bill to
              </strong>
              <div style={textStyle}>
                {currentUser.name && (
                  <div style={{ textTransform: 'uppercase' }}>
                    {currentUser.name}
                  </div>
                )}
                {currentUser.email && <div>{currentUser.email}</div>}
              </div>
            </div>
          )}

          {/* Items Table */}
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ marginBottom: '20px', textAlign: 'left' }}
          >
            {/* Table Head */}
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid #000000',
                  ...textStyle,
                  color: '#1a202c',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                <th style={{ padding: '10px 5px' }}>Description</th>
                <th style={{ padding: '10px 5px', width: '15%' }}>Qty</th>
                <th style={{ padding: '10px 5px', width: '20%' }}>Price</th>
                <th style={{ padding: '10px 5px', width: '20%' }}>Amount</th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              <tr style={{ ...textStyle, fontSize: '15px' }}>
                <td style={{ padding: '10px 5px', verticalAlign: 'top' }}>
                  {description}
                  {period && (
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#718096',
                        marginTop: '4px',
                      }}
                    >
                      {period}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 5px', verticalAlign: 'top' }}>
                  {invoiceQuantity}
                </td>
                <td style={{ padding: '10px 5px', verticalAlign: 'top' }}>
                  {unitPrice}
                </td>
                <td style={{ padding: '10px 5px', verticalAlign: 'top' }}>
                  {amount}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals Section */}
          <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ textAlign: 'left', marginBottom: '32px' }}
          >
            <tbody>
              <tr>
                <td style={{ width: '50%' }}>&nbsp;</td>
                <td style={{ width: '50%' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                      {/* Subtotal */}
                      <tr style={{ ...textStyle, fontSize: '15px' }}>
                        <td style={{ padding: '5px' }}>Subtotal</td>
                        <td style={{ padding: '5px', textAlign: 'right' }}>
                          {amount}
                        </td>
                      </tr>
                      {/* Total */}
                      <tr
                        style={{
                          ...textStyle,
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1a202c',
                        }}
                      >
                        <td
                          colSpan={2}
                          style={{
                            borderTop: '1px solid #000000',
                            paddingTop: '8px',
                            marginTop: '8px',
                          }}
                        ></td>
                      </tr>
                      <tr
                        style={{
                          ...textStyle,
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1a202c',
                        }}
                      >
                        <td style={{ padding: '5px 5px 0' }}>Total</td>
                        <td
                          style={{ padding: '5px 5px 0', textAlign: 'right' }}
                        >
                          {amount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* --- ORIGINAL FOOTER CONTENT --- */}
          <p style={{ ...textStyle, textAlign: 'center', marginBottom: '4px' }}>
            Happy creating!
          </p>
          <p
            style={{
              ...textStyle,
              textAlign: 'center',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            The <span style={{ color: '#4a569d' }}>Model For You</span> Team
          </p>
        </div>
      </div>
    </div>
  );
};
