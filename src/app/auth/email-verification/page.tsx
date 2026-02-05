import React, { Suspense } from 'react';
import { EmailVerificationForm } from '../_components/EmailVerificationForm';

function EmailVerificationPage() {
  return (
    <Suspense>
      <EmailVerificationForm />
    </Suspense>
  );
}

export default EmailVerificationPage;
