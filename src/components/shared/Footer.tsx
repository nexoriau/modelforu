"use client";
import React from "react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-600">
      <p suppressHydrationWarning>
        {t("footer.copyright")} {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-800" suppressHydrationWarning>
          {t("footer.companyName")}
        </span>
        . {t("footer.allRightsReserved")}
      </p>
    </footer>
  );
}

export default Footer;
