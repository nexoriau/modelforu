'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride-react-19';

interface OnboardingTourProps {
  userEmail?: string;
}

export default function OnboardingTour({ userEmail }: OnboardingTourProps) {
  const [runTour, setRunTour] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mark when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if tour should run
  useEffect(() => {
    // Don't run on server or without user email
    if (!isClient || !userEmail) {
      return;
    }

    try {
      const storageKey = `onboarding-completed-${userEmail}`;
      const hasCompletedTour = localStorage.getItem(storageKey);

      // Only run if user hasn't completed tour before
      if (!hasCompletedTour) {
        // Wait for page to fully load
        const timer = setTimeout(() => {
          setRunTour(true);
        }, 1200); // Wait 1.2 seconds for page to load

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  }, [userEmail, isClient]);

  // Handle tour completion
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) && userEmail) {
      setRunTour(false);
      
      try {
        // Save completion to localStorage
        const storageKey = `onboarding-completed-${userEmail}`;
        localStorage.setItem(storageKey, 'true');
      } catch (error) {
        console.error('Error saving tour completion:', error);
      }
    }
  };

  // Don't render anything on server
  if (!isClient) {
    return null;
  }

  const steps: Step[] = [
    {
      target: '[data-tour="my-models"]',
      title: 'Create New Model',
      content:
        'Manage your personal models, create new ones, or edit existing models from this section.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '[data-tour="recent-activity"]',
      title: 'Recent Activity',
      content:
        'Track recent activities and interactions with your models and download photos and videos.',
      placement: 'right',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          fontSize: 14,
          borderRadius: 8,
          padding: '8px 16px',
        },
        buttonBack: {
          marginRight: 10,
          fontSize: 14,
          color: '#6b7280',
        },
        buttonSkip: {
          fontSize: 14,
          color: '#fff',
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}