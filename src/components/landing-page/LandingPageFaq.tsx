"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQSection = () => {
  const { t } = useTranslation();
  const faqs = [
    {
      id: "item-1",
      question: t("landingPage.faq.list.q1.q"),
      answer: t("landingPage.faq.list.q1.a"),
    },
    {
      id: "item-2",
      question: t("landingPage.faq.list.q2.q"),
      answer: t("landingPage.faq.list.q2.a"),
    },
    {
      id: "item-3",
      question: t("landingPage.faq.list.q3.q"),
      answer: t("landingPage.faq.list.q3.a"),
    },
    {
      id: "item-4",
      question: t("landingPage.faq.list.q4.q"),
      answer: t("landingPage.faq.list.q4.a"),
    },
    {
      id: "item-5",
      question: t("landingPage.faq.list.q5.q"),
      answer: t("landingPage.faq.list.q5.a"),
    },
    {
      id: "item-6",
      question: t("landingPage.faq.list.q6.q"),
      answer: t("landingPage.faq.list.q6.a"),
    },
    {
      id: "item-7",
      question: t("landingPage.faq.list.q7.q"),
      answer: t("landingPage.faq.list.q7.a"),
    },
  ];

  return (
    <div className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4"
            suppressHydrationWarning
          >
            {t("landingPage.faq.title")}
          </h2>
          <p
            className="text-gray-500 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed"
            suppressHydrationWarning
          >
            {t("landingPage.faq.subtitle")}
          </p>
        </div>

        {/* Accordion Section */}
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <AccordionTrigger
                className="text-left py-5 text-gray-700 hover:text-gray-900 font-normal text-[15px] hover:no-underline"
                suppressHydrationWarning
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent
                className="text-gray-600 text-sm leading-relaxed pb-5 pt-1"
                suppressHydrationWarning
              >
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQSection;
