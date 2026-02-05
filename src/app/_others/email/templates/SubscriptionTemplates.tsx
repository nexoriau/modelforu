// utils/email-templates.ts
import { UserTableType } from '@/db/schema/auth';
import { SubscriptionHistoryTableType } from '@/db/schema/subscription-history';
import { dateFormatter } from '@/lib/utils-functions/dateFormatter';
import { formatCurrency } from '@/lib/utils-functions/formatCurrency';
import React from 'react';

// Common styles
const containerStyle: React.CSSProperties = {
  backgroundColor: '#f7f9fc',
  padding: '24px',
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const cardStyle: React.CSSProperties = {
  maxWidth: '680px',
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

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#4a569d',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 600,
  marginTop: '16px',
};

// Subscription Activated Template
interface SubscriptionActivatedProps {
  planName: string;
  tokenQuantity: number;
  price: number;
  interval: string;
  nextRenewalDate: string;
  customerEmail: string;
}

interface SubscriptionActivationInvoiceProps
  extends SubscriptionActivatedProps {
  transaction?: SubscriptionHistoryTableType;
  currentUser: UserTableType;
}

// ---
// NEW COMBINED COMPONENT
// ---
export const SubscriptionActivationInvoice = ({
  planName,
  tokenQuantity,
  price,
  interval,
  nextRenewalDate,
  customerEmail,
  transaction,
  currentUser,
}: SubscriptionActivationInvoiceProps) => {
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
  const expiryDate = transaction?.tokensExpireAt
    ? dateFormatter(transaction?.tokensExpireAt, 'MMMM DD, YYYY')
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

  const quantity = transaction?.tokenQuantity
    ? transaction?.tokenQuantity.toString()
    : '1';
  const unitPrice = formatCurrency(transaction?.price ? +transaction.price : 0);
  const amount = formatCurrency(transaction?.price ? +transaction.price : 0);

  // --- Component render ---
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* === SUBSCRIPTION ACTIVATED PART === */}
        <h1 style={headerStyle}>Your Subscription is Active!</h1>
        <p style={textStyle}>
          Thank you for subscribing to <strong>{planName}</strong>. Your account
          has been upgraded.
        </p>

        <div style={detailsContainer}>
          <div style={detailRow}>
            <span style={labelStyle}>Plan: </span>
            <span style={valueStyle}>{planName}</span>
          </div>
          <div style={detailRow}>
            <span style={labelStyle}>Credits per Cycle: </span>
            <span style={valueStyle}>{tokenQuantity}</span>
          </div>
          <div style={detailRow}>
            <span style={labelStyle}>Billing Cycle: </span>
            <span style={valueStyle}>Every {interval}</span>
          </div>
          <div style={detailRow}>
            <span style={labelStyle}>Price: </span>
            <span style={valueStyle}>
              ${price.toFixed(2)}/{interval}
            </span>
          </div>
          <div
            style={{
              ...detailRow,
              borderTop: '1px solid #eee',
              paddingTop: '12px',
            }}
          >
            <span style={{ ...labelStyle, fontWeight: 'bold' }}>
              Next Renewal:
            </span>
            <span style={{ ...valueStyle, fontWeight: 'bold' }}>
              {nextRenewalDate}
            </span>
          </div>
        </div>

        <p style={textStyle}>
          You can manage your subscription anytime from your account settings.
          Your credits will be automatically refreshed on each billing cycle.
        </p>

        {/* === INVOICE & FOOTER PART === */}
        {/* This div uses footerStyle for the top border and centered CTA */}
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
                  {quantity}
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

          <p
            style={{
              ...textStyle,
              color: '#718096',
              fontSize: '14px',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Thank you for your business.
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL}user/dashboard`}
            style={buttonStyle}
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export const SubscriptionActivated = ({
  planName,
  tokenQuantity,
  price,
  interval,
  nextRenewalDate,
  customerEmail,
}: SubscriptionActivatedProps) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headerStyle}>Your Subscription is Active!</h1>
      <p style={textStyle}>
        Thank you for subscribing to <strong>{planName}</strong>. Your account
        has been upgraded.
      </p>

      <div style={detailsContainer}>
        <div style={detailRow}>
          <span style={labelStyle}>Plan: </span>
          <span style={valueStyle}>{planName}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Credits per Cycle: </span>
          <span style={valueStyle}>{tokenQuantity}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Billing Cycle: </span>
          <span style={valueStyle}>Every {interval}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Price: </span>
          <span style={valueStyle}>
            ${price.toFixed(2)}/{interval}
          </span>
        </div>
        <div
          style={{
            ...detailRow,
            borderTop: '1px solid #eee',
            paddingTop: '12px',
          }}
        >
          <span style={{ ...labelStyle, fontWeight: 'bold' }}>
            Next Renewal:
          </span>
          <span style={{ ...valueStyle, fontWeight: 'bold' }}>
            {nextRenewalDate}
          </span>
        </div>
      </div>

      <p style={textStyle}>
        You can manage your subscription anytime from your account settings.
        Your credits will be automatically refreshed on each billing cycle.
      </p>

      <div style={footerStyle}>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}user/dashboard`}
          style={buttonStyle}
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
);
export const SubscriptionRenewed = ({
  planName,
  tokenQuantity,
  price,
  interval,
  nextRenewalDate,
  customerEmail,
}: SubscriptionActivatedProps) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headerStyle}>Your Subscription is Renewed!</h1>
      <p style={textStyle}>
        Thank you for renewing to <strong>{planName}</strong>. Your account has
        been upgraded.
      </p>

      <div style={detailsContainer}>
        <div style={detailRow}>
          <span style={labelStyle}>Plan: </span>
          <span style={valueStyle}>{planName}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Credits per Cycle: </span>
          <span style={valueStyle}>{tokenQuantity}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Billing Cycle: </span>
          <span style={valueStyle}>Every {interval}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Price: </span>
          <span style={valueStyle}>
            ${price.toFixed(2)}/{interval}
          </span>
        </div>
        <div
          style={{
            ...detailRow,
            borderTop: '1px solid #eee',
            paddingTop: '12px',
          }}
        >
          <span style={{ ...labelStyle, fontWeight: 'bold' }}>
            Next Renewal:
          </span>
          <span style={{ ...valueStyle, fontWeight: 'bold' }}>
            {nextRenewalDate}
          </span>
        </div>
      </div>

      <p style={textStyle}>
        You can manage your subscription anytime from your account settings.
        Your credits will be automatically refreshed on each billing cycle.
      </p>

      <div style={footerStyle}>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}user/dashboard`}
          style={buttonStyle}
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
);

// Subscription Cancellation Notice Template
interface SubscriptionCancellationNoticeProps {
  planName: string;
  endDate: string;
  tokenQuantity: number;
  customerEmail: string;
}

export const SubscriptionCancellationNotice = ({
  planName,
  endDate,
  tokenQuantity,
  customerEmail,
}: SubscriptionCancellationNoticeProps) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headerStyle}>Your Subscription Will End Soon</h1>
      <p style={textStyle}>
        We’ve received your request to cancel your <strong>{planName}</strong>{' '}
        subscription.
      </p>
      <p style={textStyle}>
        You’ll continue to have access to all features until{' '}
        <strong>{endDate}</strong>. After this date, your account will revert to
        the free plan.
      </p>

      <div style={detailsContainer}>
        <div style={detailRow}>
          <span style={labelStyle}>Subscription: </span>
          <span style={valueStyle}>{planName}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Remaining Credits: </span>
          <span style={valueStyle}>{tokenQuantity}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Access Ends: </span>
          <span style={valueStyle}>{endDate}</span>
        </div>
      </div>

      <p style={textStyle}>
        We’re sorry to see you go. If you change your mind, you can reactivate
        your subscription anytime before {endDate} to continue without
        interruption.
      </p>

      <div style={footerStyle}>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}user/subscription`}
          style={buttonStyle}
        >
          Reactivate Subscription
        </a>
      </div>
    </div>
  </div>
);

// Subscription Ended Template
interface SubscriptionEndedProps {
  planName: string;
  endDate: string;
  remainingTokens: number;
  customerEmail: string;
}

export const SubscriptionEnded = ({
  planName,
  endDate,
  remainingTokens,
  customerEmail,
}: SubscriptionEndedProps) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headerStyle}>Your Subscription Has Ended</h1>
      <p style={textStyle}>
        Your <strong>{planName}</strong> subscription ended on{' '}
        <strong>{endDate}</strong>. Your account has been downgraded to the free
        plan.
      </p>

      <div style={detailsContainer}>
        <div style={detailRow}>
          <span style={labelStyle}>Subscription: </span>
          <span style={valueStyle}>{planName}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Remaining Credits: </span>
          <span style={valueStyle}>{remainingTokens}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Ended On: </span>
          <span style={valueStyle}>{endDate}</span>
        </div>
      </div>

      <p style={textStyle}>
        You still have <strong>{remainingTokens} credits</strong> available to
        use. These will remain in your account until you use them.
      </p>
      <p style={textStyle}>
        All your data and settings have been preserved. You can resubscribe
        anytime to regain full access to premium features.
      </p>

      <div style={footerStyle}>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}user/subscription`}
          style={buttonStyle}
        >
          View Subscription Options
        </a>
        <p style={{ ...textStyle, marginTop: '24px' }}>
          Thank you for being part of our community. We hope to see you again
          soon!
        </p>
      </div>
    </div>
  </div>
);

interface LowCreditsProps {
  planName: string;
  remainingCredits: number;
  customerEmail: string;
}

export const LowCredits = ({ planName, remainingCredits }: LowCreditsProps) => (
  <div style={containerStyle}>
    <div style={cardStyle}>
      <h1 style={headerStyle}>Your Credits Are Running Low</h1>
      <p style={textStyle}>
        We noticed that your credits for <strong>{planName}</strong> are getting
        low. You currently have <strong>{remainingCredits}</strong> credits
        remaining.
      </p>

      <div style={detailsContainer}>
        <div style={detailRow}>
          <span style={labelStyle}>Plan: </span>
          <span style={valueStyle}>{planName}</span>
        </div>
        <div style={detailRow}>
          <span style={labelStyle}>Remaining Credits: </span>
          <span style={valueStyle}>{remainingCredits}</span>
        </div>
      </div>

      <p style={textStyle}>
        To avoid any interruption in your service, consider upgrading your plan
        or purchasing additional credits. You can manage your subscription and
        add more credits from your account settings.
      </p>

      <div style={footerStyle}>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL}user/subscription`}
          style={buttonStyle}
        >
          Add More Credits
        </a>
        <p style={{ ...textStyle, marginTop: '24px' }}>
          If you have any questions, our support team is here to help.
        </p>
      </div>
    </div>
  </div>
);
