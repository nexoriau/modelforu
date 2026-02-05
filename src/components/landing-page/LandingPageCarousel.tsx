"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Play } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const VisualCreationsGallery = () => {
  const { t } = useTranslation();
  const items = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop",
      alt: t("landingPage.carousel.items.anime"),
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop",
      alt: t("landingPage.carousel.items.cat"),
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop",
      alt: t("landingPage.carousel.items.portrait"),
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=500&fit=crop",
      alt: t("landingPage.carousel.items.yinyang"),
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop",
      alt: t("landingPage.carousel.items.abstract"),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight mb-6 font-bold text-gray-900 "
            suppressHydrationWarning
          >
            {t("landingPage.carousel.title")}
          </h1>
          <p
            className="text-gray-500 text-sm md:text-base max-w-3xl mx-auto leading-relaxed"
            suppressHydrationWarning
          >
            {t("landingPage.carousel.subtitle")}
          </p>
        </div>

        {/* Carousel Section */}
        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {items.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <Card className="border-0 p-0 shadow-lg overflow-hidden group cursor-pointer bg-white">
                    <CardContent className="p-0 aspect-3/4 relative">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        className="w-full h-full absolute object-cover transition-transform duration-500 group-hover:scale-105"
                        suppressHydrationWarning
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110">
                          <Play
                            className="w-7 h-7 text-gray-900 ml-1"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                      {/* Static Play Button (visible on cards) */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play
                            className="w-6 h-6 text-gray-800 ml-0.5"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
            <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white shadow-lg border-gray-200 hover:bg-gray-50" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default VisualCreationsGallery;
